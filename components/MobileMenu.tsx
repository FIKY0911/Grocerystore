"use client";

import { AlignLeft } from "lucide-react";
import React from "react";
import SideMenu from "./SideMenu";

interface MobileMenuProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hover:text-shop_darkColor hoverEffect hover:cursor-pointer"
      >
        <AlignLeft />
      </button>

      <SideMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default MobileMenu;
