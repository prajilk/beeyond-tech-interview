import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
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

        // Users can only access their own history
        if (session.user.id !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        await connectToDatabase();

        let query = {};

        if (session.user.role === "customer") {
            // For customers, show all their orders
            query = { customer: userId };
        } else if (session.user.role === "delivery") {
            // For delivery partners, show orders they delivered
            query = {
                deliveryPartner: userId,
                status: "delivered",
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
        console.error("Get order history error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}
