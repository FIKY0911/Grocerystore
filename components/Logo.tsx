import Image from "next/image";
import Link from "next/link";
import React from "react";
import defaultLogo from "../images/logo/GroceryStore.webp"; // Renamed to avoid conflict with 'src' prop

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  src?: string; // Optional prop for custom logo source
}

const Logo: React.FC<LogoProps> = ({
  className,
  width = 185,
  height = 65,
  alt = "Grocery Store Logo",
  src = defaultLogo, // Use defaultLogo if src is not provided
}) => {
  return (
    <Link href="/" className={`flex items-center ${className || ""}`}>
      <div className="relative flex-shrink-0" style={{ width: `${width}px`, height: `${height}px` }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
};

export default Logo;
