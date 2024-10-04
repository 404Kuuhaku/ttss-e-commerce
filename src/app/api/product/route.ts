// src/app/api/product/route.ts

import connectMongo from "@/util/mongodb/connect-mongo";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import ProductModel, { IProduct } from "@/models/product";

export async function GET() {
	try {
		await connectMongo();
		// const products = await ProductModel.find().populate("warehouse");
		const products = await ProductModel.find();
		return NextResponse.json(products);
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error fetching products",
				error: error,
			},
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		await connectMongo();
		const data: IProduct = await req.json();
		const newProduct = new ProductModel(data);
		await newProduct.save();
		return NextResponse.json(newProduct, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{
				message: "Error creating product",
				error: error,
			},
			{ status: HttpStatusCode.BadRequest }
		);
	}
}
