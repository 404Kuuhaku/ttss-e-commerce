// src/app/api/order/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import OrderModel, { IOrder, IOrderProduct } from "@/models/order";
import UserModel from "@/models/user";
import WarehouseModel from "@/models/warehouse";
import { sendEmail } from "@/util/email/sendEmail";

export async function GET() {
	try {
		await connectMongo();
		const orders = await OrderModel.find()
			.populate("user")
			.populate("products.product")
			.populate("products.warehouse");
		return NextResponse.json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{
				message: "Error fetching orders",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		await connectMongo();
		const { user, products } = await req.json();

		// const userDoc = await UserModel.findById(user)
		// 	.select("location")
		// 	.session(session);

		const userDoc = await UserModel.findById(user)
			.select("location email")
			.session(session);
		if (!userDoc) {
			await session.abortTransaction();
			return NextResponse.json(
				{ message: "User not found." },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		const userLocation = userDoc.location;
		const orderProducts: IOrderProduct[] = [];

		for (const product of products) {
			const nearestWarehouse = await WarehouseModel.findOne({
				location: {
					$nearSphere: {
						$geometry: {
							type: "Point",
							coordinates: userLocation.coordinates,
						},
						$maxDistance: 5000000,
					},
				},
				products: {
					$elemMatch: {
						product: product.product,
						stock: { $gte: product.quantity },
					},
				},
			})
				.populate("products.product")
				.session(session);

			if (!nearestWarehouse) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						message: `No nearby warehouse has enough stock for product: ${product.product}`,
					},
					{ status: HttpStatusCode.BadRequest }
				);
			}

			orderProducts.push({
				product: product.product,
				quantity: product.quantity,
				warehouse: nearestWarehouse._id,
			});

			const result = await WarehouseModel.findOneAndUpdate(
				{
					_id: nearestWarehouse._id,
					"products.product": product.product,
				},
				{ $inc: { "products.$.stock": -product.quantity } },
				{ session, new: true, runValidators: true }
			);

			if (!result) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						message: `Stock update failed for product: ${product.product}`,
					},
					{ status: HttpStatusCode.BadRequest }
				);
			}
		}

		const orderData: IOrder = {
			user,
			products: orderProducts,
			orderStatus: "ordered",
			paymentStatus: "pending",
			shippingStatus: "pending",
		};

		const newOrder = new OrderModel(orderData);

		const emailContent = `
		<h2>Your Order Confirmation</h2>
		<p>Order ID: ${newOrder._id}</p>
		<p>Status: ${newOrder.orderStatus}</p>
		<p>Payment Status: ${newOrder.paymentStatus}</p>
		<p>Shipping Status: ${newOrder.shippingStatus}</p>
		<h3>Products:</h3>
		<ul>
			${newOrder.products
				.map(
					(product: IOrderProduct) => `
				<li>Product ID: ${product.product}, Quantity: ${product.quantity}</li>
			`
				)
				.join("")}
		</ul>
	`;

		await sendEmail(
			userDoc.email,
			"Order Created",
			`Your order with ID: ${newOrder._id} has been created.`,
			emailContent
		);

		await newOrder.save({ session });

		await session.commitTransaction();
		session.endSession();

		return NextResponse.json(newOrder, { status: 201 });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		const errorMessage =
			(error as { message?: string }).message || "Error creating order";
		return NextResponse.json(
			{ message: errorMessage },
			{ status: HttpStatusCode.InternalServerError }
		);
	}
}
