import mongoose, { model, models, Schema } from "mongoose";


export interface IOrderProduct {
	product: mongoose.Types.ObjectId;
	quantity: number;
	warehouse: mongoose.Types.ObjectId;
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
	warehouse: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Warehouse",
		required: true,
	}
});

export interface IOrder {
	user: mongoose.Types.ObjectId;
	products: IOrderProduct[];
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
