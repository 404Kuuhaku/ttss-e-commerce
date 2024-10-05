// src/app/api/order/[id]/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import OrderModel, { IOrder } from "@/models/order";

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
