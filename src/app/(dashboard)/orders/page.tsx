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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/socket";

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
    deliveryPartner?: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function OrdersPage() {
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
        const fetchOrders = async () => {
            if (!session?.user) return;

            try {
                const response = await fetch(
                    `/api/orders/customer/${session.user.id}`
                );
                const data = await response.json();

                if (data.success) {
                    setOrders(data.orders);
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
                    description: "Failed to fetch orders. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchOrders();
        }
    }, [session, toast]);

    useEffect(() => {
        socket.emit("joinRoom", session?.user.id);
        socket.on("update-order-table", (orderId, status) => {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status } : order
                )
            );
        });
    }, [session]);

    // useEffect(() => {
    //     if (!session?.user) return;

    //     // Setup socket connection
    //     const socket = io();

    //     // Join rooms for all orders
    //     orders.forEach((order) => {
    //         socket.emit("join-room", order._id);
    //     });

    //     // Listen for order updates
    //     socket.on("order-updated", (updatedOrder) => {
    //         setOrders((prevOrders) =>
    //             prevOrders.map((order) =>
    //                 order._id === updatedOrder._id ? updatedOrder : order
    //             )
    //         );

    //         toast({
    //             title: "Order Updated",
    //             description: `Order #${updatedOrder._id.slice(
    //                 -5
    //             )} status changed to ${updatedOrder.status.replace("_", " ")}`,
    //         });
    //     });

    //     return () => {
    //         socket.disconnect();
    //     };
    // }, [session, orders, toast]);

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

    if (session.user?.role !== "customer") {
        router.push("/dashboard");
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="container flex-1 py-6 mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <Button onClick={() => router.push("/orders/new")}>
                        Place New Order
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <div className="py-12 text-center">
                        <h3 className="mb-2 text-lg font-medium">
                            No orders yet
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                            You haven&apos;t placed any orders yet. Start by
                            placing your first order.
                        </p>
                        <Button onClick={() => router.push("/orders/new")}>
                            Place First Order
                        </Button>
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Delivery Partner</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">
                                            #{order._id.slice(-5)}
                                        </TableCell>
                                        <TableCell>{order.productId}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(order.createdAt),
                                                "MMM dd, yyyy"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {order.deliveryPartner
                                                ? order.deliveryPartner.name
                                                : "-"}
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
