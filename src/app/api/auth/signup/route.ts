import connectMongo from "@/util/mongodb/connect-mongo";
// import axios, { HttpStatusCode } from "axios";
import { HttpStatusCode } from "axios";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "@/models/user";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await connectMongo();

		const { name, email, password, location }: IUser = await req.json();

		if (
			!name ||
			!email ||
			!password ||
			!location ||
			!location.type ||
			!location.coordinates
		) {
			return NextResponse.json(
				{ error: "All fields are required." },
				{ status: HttpStatusCode.BadRequest }
			);
		}
		const salt = 10;
		const hashedPassword = bcrypt.hashSync(password, salt);
		const newUser = await UserModel.create({
			name,
			email,
			password: hashedPassword,
			location,
		});

		return Response.json({
			message: "create user successful",
			data: { newUser },
		});
	} catch (error) {
		return Response.json({ error }, { status: HttpStatusCode.BadRequest });
	}
}

// export async function GET() {
// 	try {
// 		await connectMongo();
// 		const users = await UserModel.find();
// 		return NextResponse.json({ data: users });
// 	} catch (error) {
// 		return NextResponse.json({ error });
// 	}
// }
