import mongoose, { model, models, Schema } from "mongoose";

export interface IWarehouse {
	name: string;
	location: {
		type: string;
		coordinates: [number, number];
	};
	products: mongoose.Types.ObjectId[];
}

const WarehouseSchema = new Schema<IWarehouse>(
	{
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
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
	},
	{
		timestamps: true,
	}
);

const WarehouseModel = models.Warehouse || model("Warehouse", WarehouseSchema);
export default WarehouseModel;
