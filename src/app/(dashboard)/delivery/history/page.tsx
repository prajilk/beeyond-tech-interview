"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useToast } from "@/hooks/use-toast";

interface Order {
    _id: string;
    productId: string;
    quantity: number;
    location: string;
    status: "pending" | "accepted" | "out_for_delivery" | "delivered";
    createdAt: string;
    updatedAt: string;
    customer: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function DeliveryHistoryPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrderHistory = async () => {
            if (!session?.user) return;

            try {
                const response = await fetch(
                    `/api/orders/history/${session.user.id}`
                );
                const data = await response.json();

                if (data.success) {
                    setOrders(data.orders);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error fetching order history",
                        description: data.message || "Something went wrong",
                    });
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        "Failed to fetch order history. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchOrderHistory();
        }
    }, [session, toast]);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    if (session.user.role !== "delivery") {
        router.push("/dashboard");
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Completed Deliveries</h1>
                    <p className="text-muted-foreground">
                        Your history of completed orders
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">
                            No completed deliveries
                        </h3>
                        <p className="text-muted-foreground">
                            You haven't completed any deliveries yet.
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Delivery Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">
                                            #{order._id.slice(-5)}
                                        </TableCell>
                                        <TableCell>
                                            {order.customer.name}
                                        </TableCell>
                                        <TableCell>{order.productId}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(order.updatedAt),
                                                "MMM dd, yyyy"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
        </div>
    );
}
