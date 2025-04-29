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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Order {
    _id: string;
    productId: string;
    quantity: number;
    location: string;
    status: "pending" | "accepted" | "out_for_delivery" | "delivered";
    createdAt: string;
    customer: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function DeliveryPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
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
        const fetchPendingOrders = async () => {
            if (!session?.user) return;

            try {
                const response = await fetch("/api/orders/pending");
                const data = await response.json();

                if (data.success) {
                    setPendingOrders(data.orders);
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
                        "Failed to fetch pending orders. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchPendingOrders();
        }
    }, [session, toast]);

    const handleAcceptOrder = async (orderId: string) => {
        setProcessingOrderId(orderId);

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "accepted" }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Order accepted",
                    description: "You have successfully accepted the order",
                });

                // Remove from pending orders list
                setPendingOrders((prevOrders) =>
                    prevOrders.filter((order) => order._id !== orderId)
                );

                // Redirect to active deliveries
                router.push("/delivery/active");
            } else {
                throw new Error(data.message || "Failed to accept order");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to accept order",
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
                    <h1 className="text-3xl font-bold">Pending Orders</h1>
                    <p className="text-muted-foreground">
                        Accept orders to start the delivery process
                    </p>
                </div>

                {pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">
                            No pending orders
                        </h3>
                        <p className="text-muted-foreground">
                            There are currently no orders waiting for delivery.
                            Check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingOrders.map((order) => (
                            <Card key={order._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
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
                                        <Badge
                                            variant="outline"
                                            className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                        >
                                            Pending
                                        </Badge>
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
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleAcceptOrder(order._id)
                                        }
                                        disabled={
                                            processingOrderId === order._id
                                        }
                                    >
                                        {processingOrderId === order._id
                                            ? "Processing..."
                                            : "Accept Order"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
