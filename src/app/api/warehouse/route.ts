// src/app/api/warehouse/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import WarehouseModel, { IWarehouse } from "@/models/warehouse";

export async function GET() {
	try {
		await connectMongo();
		const warehouses = await WarehouseModel.find().populate(
			"products.product"
		);
		// const warehouses = await WarehouseModel.find();
		return NextResponse.json(warehouses);
	} catch (error: unknown) {
		return NextResponse.json(
			{
				message: "Error fetching warehouses",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		await connectMongo();
		const data: IWarehouse = await req.json();
		const newWarehouse = new WarehouseModel(data);
		await newWarehouse.save();
		return NextResponse.json(newWarehouse, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error creating warehouse",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	}
}
