"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Truck, CheckCircle } from "lucide-react";
import { socket } from "@/socket";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        delivered: 0,
    });
    // const [isConnected, setIsConnected] = useState(false);
    // const [transport, setTransport] = useState("N/A");

    // useEffect(() => {
    //     if (socket.connected) {
    //         onConnect();
    //     }

    //     function onConnect() {
    //         setIsConnected(true);
    //         setTransport(socket.io.engine.transport.name);

    //         socket.io.engine.on("upgrade", (transport) => {
    //             setTransport(transport.name);
    //         });
    //     }

    //     function onDisconnect() {
    //         setIsConnected(false);
    //         setTransport("N/A");
    //     }

    //     socket.on("connect", onConnect);
    //     socket.on("disconnect", onDisconnect);

    //     socket.on("pending-count", (count) => {
    //         setOrderStats((prevState) => ({
    //             ...prevState,
    //             pending: prevState.pending + Number(count),
    //         }));
    //     });
    //     socket.on("in-progress-count", (count) => {
    //         setOrderStats((prevState) => ({
    //             ...prevState,
    //             inProgress: prevState.inProgress + Number(count),
    //         }));
    //     });
    //     socket.on("delivered-count", (count) => {
    //         setOrderStats((prevState) => ({
    //             ...prevState,
    //             delivered: prevState.delivered + Number(count),
    //         }));
    //     });

    //     return () => {
    //         socket.off("connect", onConnect);
    //         socket.off("disconnect", onDisconnect);
    //     };
    // }, []);

    useEffect(() => {
        socket.emit("joinRoom", session?.user.id);
        socket.on("update-order-status", (orderStatus) => {
            setOrderStats(orderStatus);
        });
    }, [socket, session]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrderStats = async () => {
            if (session?.user) {
                try {
                    // Get all orders for the user
                    const response = await fetch("/api/orders");
                    const data = await response.json();

                    if (data.success && data.orders) {
                        const orders = data.orders;
                        setOrderStats({
                            total: orders.length,
                            pending: orders.filter(
                                (order: any) => order.status === "pending"
                            ).length,
                            inProgress: orders.filter(
                                (order: any) =>
                                    order.status === "accepted" ||
                                    order.status === "out_for_delivery"
                            ).length,
                            delivered: orders.filter(
                                (order: any) => order.status === "delivered"
                            ).length,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching order stats:", error);
                }
            }
        };

        fetchOrderStats();
    }, [session]);

    if (status === "loading") {
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

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="container flex-1 py-6 mx-auto">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">
                        Welcome, {session.user?.name}
                    </h1>
                    <p className="text-muted-foreground">
                        {session.user?.role === "customer"
                            ? "Track your orders and place new ones"
                            : "Manage deliveries and track your progress"}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Total Orders
                            </CardTitle>
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {orderStats.total}
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">
                                All time orders
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                            <Package className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {orderStats.pending}
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">
                                Waiting to be accepted
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                In Progress
                            </CardTitle>
                            <Truck className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {orderStats.inProgress}
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">
                                Currently being delivered
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Delivered
                            </CardTitle>
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {orderStats.delivered}
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">
                                Successfully completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    {session.user?.role === "customer" ? (
                        <Button onClick={() => router.push("/orders/new")}>
                            Place New Order
                        </Button>
                    ) : (
                        <Button onClick={() => router.push("/delivery")}>
                            Manage Pending Orders
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}
