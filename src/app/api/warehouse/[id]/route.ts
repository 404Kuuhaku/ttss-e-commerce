// src/app/api/warehouse/[id]/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import WarehouseModel, { IWarehouse } from "@/models/warehouse";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectMongo();

		const id = params.id;
		const data: IWarehouse = await req.json();
		const updatedWarehouse = await WarehouseModel.findByIdAndUpdate(
			id,
			data,
			{
				new: true,
			}
		);
		return NextResponse.json(updatedWarehouse);
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error updating warehouse",
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
		await WarehouseModel.findByIdAndDelete(id);
		return NextResponse.json({ message: "Warehouse deleted" });
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error deleting warehouse",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	}
}
