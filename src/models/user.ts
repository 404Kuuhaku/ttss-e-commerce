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
			},
		},
		role: {
			type: String,
			enum: ["customer", "mod", "admin", "logistic", "seller"],
			default: "customer",
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.index({ location: "2dsphere" });

const UserModel = models.User || model("User", UserSchema);
export default UserModel;
