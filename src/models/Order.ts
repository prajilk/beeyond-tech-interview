import mongoose, { Document } from "mongoose";

export interface IOrder extends Document {
    customer: mongoose.Schema.Types.ObjectId;
    deliveryPartner?: mongoose.Schema.Types.ObjectId;
    productId: string;
    quantity: number;
    location: string;
    status: "pending" | "accepted" | "out_for_delivery" | "delivered";
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        productId: {
            type: String,
            required: [true, "Product ID is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: 1,
        },
        location: {
            type: String,
            required: [true, "Delivery location is required"],
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "out_for_delivery", "delivered"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Order ||
    mongoose.model<IOrder>("Order", OrderSchema);
