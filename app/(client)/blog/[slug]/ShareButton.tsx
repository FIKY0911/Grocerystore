"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: title || '',
        url: window.location.href,
      }).catch(() => {
        // Ignore if user cancels share
      });
    } else {
      // Fallback: copy to clipboard
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        alert('Link berhasil disalin!');
      }
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleShare}
      className="gap-2 bg-shop_dark_green text-white hover:bg-shop_dark_green/90"
    >
      <Share2 size={16} />
      Bagikan
    </Button>
  );
}
