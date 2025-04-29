import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

// Create a new order
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "customer") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { productId, quantity, location } = await req.json();

        if (!productId || !quantity || !location) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required",
                },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const order = await Order.create({
            customer: session.user.id,
            productId,
            quantity,
            location,
            status: "pending",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Order created successfully",
                order,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}

// Get all orders (admin only, or filtered by user role)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        await connectToDatabase();

        let query = {};

        if (session.user?.role === "customer") {
            query = { customer: session.user.id };
        } else if (session.user?.role === "delivery") {
            // Delivery partners can see orders assigned to them or pending ones
            query = {
                $or: [
                    { deliveryPartner: session.user.id },
                    { status: "pending" },
                ],
            };
        }

        const orders = await Order.find(query)
            .populate("customer", "name email")
            .populate("deliveryPartner", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}
