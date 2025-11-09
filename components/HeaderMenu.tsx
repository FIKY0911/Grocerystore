"use client";

import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const HeaderMenu = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-center gap-8 text-sm font-semibold text-shop_lightColor">
      {headerData?.map((item) => (
        <div key={item?.title} className="relative inline-block">
          <Link
            href={item?.href}
            className={`relative z-10 transition-colors duration-300 hover:text-shop_dark_green 
            after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 
            after:bg-shop_dark_green after:transition-all after:duration-300 
            hover:after:w-full 
            ${
              pathname === item?.href
                ? "text-shop_btn_dark_green after:w-full after:bg-shop_btn_dark_green"
                : ""
            }`}
          >
            {item?.title}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default HeaderMenu;
