import { model, models, Schema } from "mongoose";

export interface IProduct {
	name: string;
	price: number;
	stock: number;
}

const ProductSchema = new Schema<IProduct>(
	{
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		stock: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const ProductModel = models.Product || model("Product", ProductSchema);
export default ProductModel;
