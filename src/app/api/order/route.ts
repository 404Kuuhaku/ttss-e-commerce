// src/app/api/order/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { HttpStatusCode } from "axios";
import OrderModel, { IOrder, IOrderProduct } from "@/models/order";
import ProductModel from "@/models/product";
import UserModel from "@/models/user";
import WarehouseModel, { IWarehouseProduct } from "@/models/warehouse";

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
	try {
		await connectMongo();

		const { user, products } = await req.json();

		const userDoc = await UserModel.findById(user).select("location");
		if (!userDoc) {
			return NextResponse.json(
				{ message: "User not found." },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		const userLocation = userDoc.location;
		// console.log(userLocation.coordinates);

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
			}).populate("products.product");

			if (!nearestWarehouse) {
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

			await WarehouseModel.updateOne(
				{
					_id: nearestWarehouse._id,
					"products.product": product.product,
				},
				{ $inc: { "products.$.stock": -product.quantity } }
			);
		}

		const orderData: IOrder = {
			user,
			products: orderProducts,
			orderStatus: "ordered",
			paymentStatus: "pending",
			shippingStatus: "pending",
		};

		const newOrder = new OrderModel(orderData);
		await newOrder.save();

		return NextResponse.json(newOrder, { status: 201 });
	} catch (error) {
		const errorMessage =
			(error as { message?: string }).message || "Error creating order";
		return NextResponse.json(
			{ message: errorMessage },
			{ status: HttpStatusCode.InternalServerError }
		);
	}
}
