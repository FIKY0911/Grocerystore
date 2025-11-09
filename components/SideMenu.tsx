// ... (impor lainnya)
import { X } from "lucide-react";
import React, { FC } from "react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOutsideClick } from "@/app/hooks";
import Logo from "./Logo";
import SocialMedia from "./SocialMedia";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);

  return (
    <div
      className={`fixed inset-0 z-50 w-full bg-black/50 text-white/70 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-black h-full p-6 flex flex-col justify-between border-r border-shop_light_green shadow-xl"
      >
        {/* === HEADER: Logo + Tombol Close === */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="text-white/80 hover:text-white hoverEffect transition"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* === MENU LINK === */}
        <div className="flex flex-col space-y-4 font-semibold tracking-wide">
          {headerData?.map((item) => (
            <Link
              href={item?.href}
              key={item?.title}
              onClick={onClose}
              className={`hover:text-shop_dark_green transition ${
                pathname === item?.href ? "text-white" : ""
              }`}
            >
              {item?.title}
            </Link>
          ))}
        </div>

        {/* === FOOTER: Sosial Media === */}
        <div className="mt-8">
          <SocialMedia />
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
