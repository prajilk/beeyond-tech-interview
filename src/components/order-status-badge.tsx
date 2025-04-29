import { Badge } from "@/components/ui/badge";

type OrderStatus = "pending" | "accepted" | "out_for_delivery" | "delivered";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    switch (status) {
        case "pending":
            return (
                <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                >
                    Pending
                </Badge>
            );
        case "accepted":
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
                >
                    Accepted
                </Badge>
            );
        case "out_for_delivery":
            return (
                <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"
                >
                    Out for Delivery
                </Badge>
            );
        case "delivered":
            return (
                <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                >
                    Delivered
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    {(status as string).replace("_", " ")}
                </Badge>
            );
    }
}
