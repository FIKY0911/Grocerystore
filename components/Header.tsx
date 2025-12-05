"use client";

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import ClerkAuthButtons from "./ClerkAuthButtons";
import MobileMenu from "./MobileMenu";
import { useUser } from "@clerk/nextjs";
import { client } from "@/sanity/lib/client";
import { MY_ORDERS_QUERY } from "@/sanity/queries/query";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import useStore from "@/store";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const { orders, setOrders } = useStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.id) {
        const fetchedOrders: MY_ORDERS_QUERYResult = await client.fetch(
          MY_ORDERS_QUERY,
          { userId: user.id }
        );
        setOrders(fetchedOrders);
      }
    };

    fetchOrders();
  }, [user, setOrders]);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        
        {/* === KIRI: Logo + MobileMenu === */}
        <div className="flex items-center gap-3 md:gap-6 pl-2 md:pl-0">
          {/* Logo hanya tampil di layar md ke atas */}
          <div
            className={`transition-all duration-300 hidden md:block ${
              isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Logo className="flex items-center" />
          </div>

          {/* MobileMenu tampil hanya di layar kecil */}
          <div className="block md:hidden">
            <MobileMenu
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>
        </div>

        {/* === TENGAH: Header Menu (hanya di desktop) === */}
        <div className="hidden md:flex flex-1 justify-center">
          <HeaderMenu />
        </div>

        {/* === KANAN: Search + Favorite + Cart + Clerk === */}
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <SearchBar />
          <FavoriteButton />
          <CartIcon />
          <ClerkAuthButtons ordersLength={orders.length} />
        </div>
      </div>
    </header>
  );
};

export default Header;
