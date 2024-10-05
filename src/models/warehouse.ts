import mongoose, { model, models, Schema } from "mongoose";

export interface IWarehouseProduct {
	product: mongoose.Types.ObjectId;
	stock: number;
}

const WarehouseProductSchema = new Schema<IWarehouseProduct>({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	stock: {
		type: Number,
		required: true,
		min: 1,
	},
});

export interface IWarehouse {
	name: string;
	location: {
		type: string;
		coordinates: [number, number];
	};
	products: IWarehouseProduct[];
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
		products: {
			type: [WarehouseProductSchema],
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

WarehouseSchema.index({ location: "2dsphere" });

const WarehouseModel = models.Warehouse || model("Warehouse", WarehouseSchema);
export default WarehouseModel;
