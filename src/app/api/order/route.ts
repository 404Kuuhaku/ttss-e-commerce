// src/app/api/order/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { HttpStatusCode } from "axios";
import OrderModel, { IOrder } from "@/models/order";
import ProductModel from "@/models/product";

export async function GET() {
	try {
		await connectMongo();
		const orders = await OrderModel.find()
			.populate("user")
			.populate("products.product")
			.populate("warehouse");
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

// export async function POST(req: NextRequest) {
// 	try {
// 		await connectMongo();
// 		const data: IOrder = await req.json();

// 		// check product stock
// 		for (const orderProduct of data.products) {
// 			const product = await ProductModel.findById(orderProduct.product);
// 			if (!product || product.stock < orderProduct.quantity) {
// 				return NextResponse.json(
// 					{
// 						message: `Not enough stock for product: ${product?.name}`,
// 					},
// 					{ status: HttpStatusCode.BadRequest }
// 				);
// 			}
// 		}

// 		// update product stock
// 		for (const orderProduct of data.products) {
// 			await ProductModel.findByIdAndUpdate(orderProduct.product, {
// 				$inc: { stock: -orderProduct.quantity },
// 			});
// 		}

// 		const newOrder = new OrderModel(data);
// 		await newOrder.save();
// 		return NextResponse.json(newOrder, { status: 201 });
// 	} catch (error) {
// 		return NextResponse.json(
// 			{
// 				message: "Error creating order",
// 				error: error,
// 			},
// 			{ status: HttpStatusCode.BadRequest }
// 		);
// 	}
// }

export async function POST(req: NextRequest) {
	let session;
	try {
		await connectMongo();
		session = await mongoose.startSession();
		session.startTransaction();

		const data: IOrder = await req.json();

		// check product stock
		for (const orderProduct of data.products) {
			const product = await ProductModel.findById(orderProduct.product)
				.session(session)
				.select("name stock");
			if (!product || product.stock < orderProduct.quantity) {
				return NextResponse.json(
					{
						message: `Not enough stock for product: ${product?.name}`,
					},
					{ status: HttpStatusCode.BadRequest }
				);
			}
		}

		// update product stock
		for (const orderProduct of data.products) {
			await ProductModel.findByIdAndUpdate(orderProduct.product, {
				$inc: { stock: -orderProduct.quantity },
			}).session(session);
		}

		const newOrder = new OrderModel(data);
		// await newOrder.save();
		await newOrder.save({ session });

		await session.commitTransaction();
		session.endSession();

		return NextResponse.json(newOrder, { status: 201 });
	} catch (error) {
		if (session && session.inTransaction()) {
			await session.abortTransaction();
		}
		return NextResponse.json(
			{
				message: "Error creating order",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	} finally {
		if (session) {
			session.endSession();
		}
	}
}
