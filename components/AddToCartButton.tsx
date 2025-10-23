"use client";
import { Product } from "@/sanity.types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import QuantityButtons from "./QuantityButtons";
import { ShoppingBag } from "lucide-react";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product?.name?.substring(0, 12)} berhasil ditambahkan!`);
    } else {
      toast.error("Tidak dapat menambah lebih dari stok yang tersedia");
    }
  };

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-darkColor/80">Jumlah</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product?.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-12 flex items-center">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "w-full py-5 px-6 m-auto bg-shop_light_green shadow-none border border-shop_light_green/80 font-semibold tracking-wide text-shop_darkColor hover:text-shop_light_bg hover:bg-shop_dark_green hover:border-shop_dark_green hoverEffect transition-all duration-200",
              className
            )}
          >
            <ShoppingBag className="mb-1"/>{isOutOfStock ? "Stok Habis" : "Tambah"}
          </Button>
        </div>
        
      )}
    </div>
  );
};

export default AddToCartButton;
