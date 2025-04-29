"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Order {
    _id: string;
    productId: string;
    quantity: number;
    location: string;
    status: "accepted" | "out_for_delivery";
    createdAt: string;
    customer: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function ActiveDeliveriesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchActiveOrders = async () => {
            if (!session?.user) return;

            try {
                const response = await fetch("/api/orders");
                const data = await response.json();

                if (data.success) {
                    // Filter orders that are accepted or out for delivery
                    const active = data.orders.filter(
                        (order: any) =>
                            (order.status === "accepted" ||
                                order.status === "out_for_delivery") &&
                            order.deliveryPartner?._id === session.user.id
                    );
                    setActiveOrders(active);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error fetching orders",
                        description: data.message || "Something went wrong",
                    });
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        "Failed to fetch active orders. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchActiveOrders();
        }
    }, [session, toast]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setProcessingOrderId(orderId);

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Order updated",
                    description: `Order status updated to ${newStatus.replace(
                        "_",
                        " "
                    )}`,
                });

                if (newStatus === "delivered") {
                    // Remove from active orders list
                    setActiveOrders((prevOrders) =>
                        prevOrders.filter((order) => order._id !== orderId)
                    );
                } else {
                    // Update the status in the list
                    setActiveOrders((prevOrders) =>
                        prevOrders.map((order) =>
                            order._id === orderId
                                ? { ...order, status: newStatus as any }
                                : order
                        )
                    );
                }
            } else {
                throw new Error(data.message || "Failed to update order");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to update order",
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong",
            });
        } finally {
            setProcessingOrderId(null);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center flex-1">
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
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="container flex-1 py-6 mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Active Deliveries</h1>
                    <p className="text-muted-foreground">
                        Manage your active deliveries and update their status
                    </p>
                </div>

                {activeOrders.length === 0 ? (
                    <div className="py-12 text-center">
                        <h3 className="mb-2 text-lg font-medium">
                            No active deliveries
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                            You don&apos;t have any active deliveries at the
                            moment.
                        </p>
                        <Button onClick={() => router.push("/delivery")}>
                            Check Pending Orders
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeOrders.map((order) => (
                            <Card key={order._id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>
                                                Order #{order._id.slice(-5)}
                                            </CardTitle>
                                            <CardDescription>
                                                {format(
                                                    new Date(order.createdAt),
                                                    "MMM dd, yyyy HH:mm"
                                                )}
                                            </CardDescription>
                                        </div>
                                        <OrderStatusBadge
                                            status={order.status}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Customer
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.customer.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Product Id
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.productId}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Quantity
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Delivery Location
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.location}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {order.status === "accepted" ? (
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                updateOrderStatus(
                                                    order._id,
                                                    "out_for_delivery"
                                                )
                                            }
                                            disabled={
                                                processingOrderId === order._id
                                            }
                                        >
                                            {processingOrderId === order._id
                                                ? "Updating..."
                                                : "Mark as Out for Delivery"}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                updateOrderStatus(
                                                    order._id,
                                                    "delivered"
                                                )
                                            }
                                            disabled={
                                                processingOrderId === order._id
                                            }
                                        >
                                            {processingOrderId === order._id
                                                ? "Updating..."
                                                : "Mark as Delivered"}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
