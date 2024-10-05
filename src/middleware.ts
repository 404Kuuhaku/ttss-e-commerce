// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const user = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const { pathname } = request.nextUrl;

	if (
		pathname.startsWith("/api/warehouse") &&
		(!user || user.role !== "seller")
	) {
		return NextResponse.json(
			{ message: "Forbidden: Seller role required" },
			{ status: 403 }
		);
	}

	if (
		pathname.startsWith("/api/product") &&
		(!user || user.role !== "seller")
	) {
		return NextResponse.json(
			{ message: "Forbidden: Seller role required" },
			{ status: 403 }
		);
	}

	if (pathname.startsWith("/api/order") && (!user || !user.role)) {
		return NextResponse.json(
			{ message: "Unauthorized: Please Login" },
			{ status: 401 }
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/api/warehouse", "/api/order", "/api/product"],
};
