import Image from "next/image";
import Link from "next/link";
import React from "react";
import images from "../images/logo/GroceryStore.webp";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <Link href="/" className="flex items-center">
        <div className="relative w-[175px] h-[58px] flex items-center justify-center">
          <Image
            src={images}
            alt="Logo"
            width={175}
            height={58}
            className="object-contain"
            priority
          />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
