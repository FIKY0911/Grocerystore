"use client";

import { ClerkLoaded, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import SignIn from "./SignIn";
import Link from "next/link";
import { Logs } from "lucide-react";
import { useEffect, useState } from "react";

interface ClerkAuthButtonsProps {
  ordersLength: number;
}

const ClerkAuthButtons: React.FC<ClerkAuthButtonsProps> = ({ ordersLength }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ClerkLoaded>
      <SignedIn>
        <Link 
          href={"/orders"} 
          className='group relative hover:text-shop_light_green hoverEffect'
          suppressHydrationWarning
        >
          <Logs/>
          {mounted && (
            <span 
              className='absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'
              suppressHydrationWarning
            >
              {ordersLength}
            </span>
          )}
        </Link>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignIn/>
      </SignedOut>
    </ClerkLoaded>
  );
};

export default ClerkAuthButtons;
