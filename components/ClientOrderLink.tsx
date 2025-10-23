"use client";

import React from 'react';
import Link from 'next/link';
import { Logs } from 'lucide-react';

interface ClientOrderLinkProps {
  orderCount: number;
}

const ClientOrderLink: React.FC<ClientOrderLinkProps> = ({ orderCount }) => {
  return (
    <Link href={"/orders"} className='group relative hover:text-shop_light_green hoverEffect'>
      <Logs/>
      <span className='absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'>
        {orderCount}
      </span>
    </Link>
  );
};

export default ClientOrderLink;
