"use client";
import { cn } from "@/lib/utils";
import { Product } from "@/sanity.types";
import useStore from "@/store";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProductSideMenu = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableProduct = favoriteProduct?.find(
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableProduct || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (product?._id) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? "Prodak sukses dihapus!"
            : "Prodak sukses ditambahkan!"
        );
      });
    }
  };

  return (
    <button
      type="button"
      aria-label={existingProduct ? "Hapus favorit" : "Tambahkan favorit"}
      onClick={handleFavorite}
      className={cn(
        `absolute top-2 right-2 p-2.5 rounded-full transition
        hover:bg-shop_dark_green/80 hover:text-white
        ${existingProduct ? "bg-shop_dark_green/80 text-white" : "bg-shop_lightColor/10"}`,
        className
      )}
    >
      <Heart size={15} />
    </button>
  );
};

export default ProductSideMenu;
