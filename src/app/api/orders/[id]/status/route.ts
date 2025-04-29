import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "delivery") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { status } = await req.json();

        if (!status) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Status is required",
                },
                { status: 400 }
            );
        }

        const validStatuses = ["accepted", "out_for_delivery", "delivered"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status",
                },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order not found",
                },
                { status: 404 }
            );
        }

        // Update logic based on status
        if (status === "accepted" && order.status === "pending") {
            order.status = "accepted";
            order.deliveryPartner = session.user.id;
        } else if (
            status === "out_for_delivery" &&
            order.status === "accepted"
        ) {
            // Only the assigned delivery partner can update
            if (order.deliveryPartner?.toString() !== session.user.id) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not assigned to this order",
                    },
                    { status: 403 }
                );
            }
            order.status = "out_for_delivery";
        } else if (
            status === "delivered" &&
            order.status === "out_for_delivery"
        ) {
            // Only the assigned delivery partner can update
            if (order.deliveryPartner?.toString() !== session.user.id) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not assigned to this order",
                    },
                    { status: 403 }
                );
            }
            order.status = "delivered";
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status transition",
                },
                { status: 400 }
            );
        }

        await order.save();

        const orders = await Order.find({
            customer: mongoose.Types.ObjectId.createFromHexString(
                order.customer.toString()
            ),
        });

        const orderStatus = {
            total: orders.length,
            pending: orders.filter((order: any) => order.status === "pending")
                .length,
            inProgress: orders.filter(
                (order: any) =>
                    order.status === "accepted" ||
                    order.status === "out_for_delivery"
            ).length,
            delivered: orders.filter(
                (order: any) => order.status === "delivered"
            ).length,
        };

        const data = {
            orderStatus,
            orderId: order._id.toString(),
            status: order.status,
        };

        await fetch(
            process.env.SOCKET_SERVER_URL +
                "/send-order-status?roomId=" +
                order.customer.toString(),
            {
                body: JSON.stringify(data),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Fetch the updated order with populated fields
        const updatedOrder = await Order.findById(orderId)
            .populate("customer", "name email")
            .populate("deliveryPartner", "name email");

        return NextResponse.json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}
