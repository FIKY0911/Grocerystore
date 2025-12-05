"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface OrderFiltersProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
  counts: {
    all: number;
    pending: number;
    paid: number;
    cancelled: number;
  };
}

const OrderFilters = ({ onFilterChange, activeFilter, counts }: OrderFiltersProps) => {
  const filters = [
    { value: "all", label: "Semua Pesanan", count: counts.all },
    { value: "pending", label: "Menunggu", count: counts.pending },
    { value: "paid", label: "Lunas", count: counts.paid },
    { value: "cancelled", label: "Dibatalkan", count: counts.cancelled },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {filter.label}
          <Badge
            variant={activeFilter === filter.value ? "secondary" : "outline"}
            className="ml-1"
          >
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

export default OrderFilters;
