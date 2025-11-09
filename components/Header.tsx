"use client";

import React, { useState } from "react";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import ClerkAuthButtons from "./ClerkAuthButtons";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <ClerkAuthButtons ordersLength={3} />
        </div>
      </div>
    </header>
  );
};

export default Header;
