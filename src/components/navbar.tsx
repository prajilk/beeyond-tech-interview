"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Package, User } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-background border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6" />
                    <span className="text-xl font-semibold">QuickCommerce</span>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <nav className="hidden md:flex items-center gap-6 mr-4">
                                {session.user.role === "customer" ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/dashboard")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/orders")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/orders/new"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/orders/new")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Place Order
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/dashboard")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/delivery"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/delivery")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Pending Orders
                                        </Link>
                                        <Link
                                            href="/delivery/active"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/delivery/active")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Active Deliveries
                                        </Link>
                                        <Link
                                            href="/delivery/history"
                                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                                isActive("/delivery/history")
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Completed Orders
                                        </Link>
                                    </>
                                )}
                            </nav>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium hidden sm:inline-block">
                                        {session.user.name}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOut()}
                                >
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
