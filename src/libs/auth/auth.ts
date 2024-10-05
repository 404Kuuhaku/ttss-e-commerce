import connectMongo from "@/util/mongodb/connect-mongo";
import UserModel from "@/models/user";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		role: string;
	}

	interface Session {
		user: {
			id: string;
			role: string;
		} & DefaultSession["user"];
	}

	interface JWT {
		id: string;
		role: string;
	}
}

interface User {
	id: string;
	name: string;
	role: string;
}
export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			// id: "credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					// placeholder: "john@doe.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials) return null;

				await connectMongo();

				const user = await UserModel.findOne({
					email: credentials?.email,
				}).select("+password");

				if (
					user &&
					user.password &&
					(await bcrypt.compare(credentials.password, user.password))
				) {
					return {
						id: user.id,
						// name: user.name,
						// email: user.email,
						role: user.role,
					} as User;
				} else {
					throw new Error("Invalid email or password");
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				// token.name = user.name;
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				// session.user.name = token.name;
				session.user.role = token.role as string;
				// session.user.image = token.picture;
			}
			return session;
		},
		// async redirect({ baseUrl }) {
		// 	return `${baseUrl}/profile`;
		// },
	},
};
