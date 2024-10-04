import { model, models, Schema } from "mongoose";

export interface IUser {
	email: string;
	password: string;
	name: string;
	location: {
		type: string;
		coordinates: [number, number];
	};
	role: "customer" | "mod" | "admin" | "logistic" | "seller";
}

const UserSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		location: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			}, // [longitude, latitude]
			// required: true,
		},
		// role: {
		// 	type: String,
		// 	enum: ["user", "dev", "admin"],
		// 	default: "user",
		// },
		role: {
			type: String,
			enum: ["customer", "mod", "admin", "logistic", "seller"],
			default: "customer",
		},
	},
	{
		timestamps: true,
		// toJSON: {
		// 	versionKey: false,
		// 	virtuals: true,
		// 	transform: (_, ret) => {
		// 		delete ret._id;
		// 	},
		// },
	}
);

// import mongoose, { Schema, CallbackError } from "mongoose";
// const UserModel =
// 	mongoose.models.UserModel || mongoose.model("User", userSchema);
const UserModel = models.User || model("User", UserSchema);
export default UserModel;
