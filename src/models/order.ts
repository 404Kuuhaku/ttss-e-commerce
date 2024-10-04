import mongoose, { model, models, Schema } from "mongoose";

// export interface IOrder {
// 	user: mongoose.Types.ObjectId;
// 	product: mongoose.Types.ObjectId;
// 	quantity: number;
// 	warehouse: mongoose.Types.ObjectId;
// 	paymentStatus: "pending" | "shipping" | "delivered" | "failed";
// 	shippingStatus: "pending" | "shipping" | "delivered" | "failed";
// }

interface IOrderProduct {
	product: mongoose.Types.ObjectId;
	quantity: number;
}

const OrderProductSchema = new Schema<IOrderProduct>({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
});

export interface IOrder {
	user: mongoose.Types.ObjectId;
	products: IOrderProduct[];
	warehouse: mongoose.Types.ObjectId;
	orderStatus: "ordered" | "cancel" | "failed" | "refund";
	paymentStatus: "pending" | "success" | "failed" | "refund";
	shippingStatus: "pending" | "shipping" | "delivered" | "failed";
}

const OrderSchema = new Schema<IOrder>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: {
			type: [OrderProductSchema],
			required: true,
		},
		warehouse: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Warehouse",
			required: true,
		},
		orderStatus: {
			type: String,
			enum: ["ordered", "cancel", "failed", "refund"],
			default: "ordered",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "success", "failed", "refund"],
			default: "pending",
		},
		shippingStatus: {
			type: String,
			enum: ["pending", "shipping", "delivered", "failed"],
			default: "pending",
		},
	},
	{
		timestamps: true,
	}
);

const OrderModel = models.Order || model("Order", OrderSchema);
export default OrderModel;
