import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b bg-background">
                <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                    <div className="flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        <span className="text-xl font-semibold">
                            QuickCommerce v2
                        </span>
                    </div>
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
                </div>
            </header>

            <main className="flex-1">
                <section className="py-12 md:py-24 lg:py-32">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                                        Order & Delivery Tracking System
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Fast, reliable delivery tracking for
                                        customers and delivery partners. Place
                                        an order and track its status in
                                        real-time.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link href="/register">
                                        <Button size="lg" className="gap-1">
                                            Get Started{" "}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button size="lg" variant="outline">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-xl bg-muted">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="grid gap-4 p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                                                    <Package className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">
                                                        Real-time tracking
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Know exactly where your
                                                        order is
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                                                    <Package className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">
                                                        Easy ordering
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Simple interface for
                                                        placing orders
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                                                    <Package className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">
                                                        Delivery management
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Efficient tools for
                                                        delivery partners
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-6 border-t md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 px-4 mx-auto md:h-16 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} QuickCommerce. All
                        rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
