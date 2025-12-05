import { MY_ORDERS_QUERYResult } from "@/sypes";
import PriceFormatter from "./PriceFormatter";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderStatsProps {
  orders: MY_ORDERS_QUERYResult;
}

const OrderStats = ({ orders }: OrderStatsProps) => {
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  const totalSpent = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Paid",
      value: paidOrders,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Cancelled",
      value: cancelledOrders,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-4 border border-gray-200`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-600">
                {stat.label}
              </span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        );
      })}

      {/* Total Spent */}
      <div className="bg-purple-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-600">Total Spent</span>
        </div>
        <PriceFormatter
          amount={totalSpent}
          className="text-lg font-bold text-purple-600"
        />
      </div>
    </div>
  );
};

export default OrderStats;

