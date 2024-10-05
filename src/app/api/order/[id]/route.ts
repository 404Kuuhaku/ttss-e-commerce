// src/app/api/order/[id]/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import OrderModel, { IOrder, IOrderProduct } from "@/models/order";
import UserModel from "@/models/user";
import { sendEmail } from "@/util/email/sendEmail";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectMongo();

		const id = params.id;
		const data: IOrder = await req.json();

		const updatedOrder = await OrderModel.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true, // TODOS Test this again
		});

		const emailContent = `
		<h2>Your Order Update</h2>
		<p>Order ID: ${updatedOrder._id}</p>
		<p>Status: ${updatedOrder.orderStatus}</p>
		<p>Payment Status: ${updatedOrder.paymentStatus}</p>
		<p>Shipping Status: ${updatedOrder.shippingStatus}</p>
		<h3>Products:</h3>
		<ul>
			${updatedOrder.products
				.map(
					(product: IOrderProduct) => `
				<li>Product ID: ${product.product}, Quantity: ${product.quantity}</li>
			`
				)
				.join("")}
		</ul>
	`;

		const userDoc = await UserModel.findById(updatedOrder?.user).select(
			"email"
		);
		if (!userDoc) {
			return NextResponse.json(
				{ message: "User not found." },
				{ status: HttpStatusCode.BadRequest }
			);
		}
		await sendEmail(
			userDoc.email,
			"Order Updated",
			`Your order with ID: ${id} has been updated.`,
			emailContent
		);

		return NextResponse.json(updatedOrder);
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error updating order",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectMongo();
		const id = params.id;
		await OrderModel.findByIdAndDelete(id);
		return NextResponse.json({ message: "Order deleted" });
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error deleting order",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	}
}
