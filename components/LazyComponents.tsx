"use client";

import dynamic from "next/dynamic";
import { Suspense, ComponentType, ReactNode } from "react";
import {
  ProductGridSkeleton,
  OrderCardSkeleton,
  BannerSkeleton,
  CategorySkeleton,
  CartSkeleton,
  ProductDetailSkeleton,
} from "./skeletons";

// Generic lazy wrapper with custom fallback
interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const LazyWrapper = ({ children, fallback }: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 rounded-md h-32" />}>
      {children}
    </Suspense>
  );
};

// Lazy loaded components with their skeletons
export const LazyProductGrid = dynamic(() => import("./ProductGrid"), {
  loading: () => <ProductGridSkeleton count={10} />,
  ssr: false,
});

export const LazyHomeBanner = dynamic(() => import("./HomeBanner"), {
  loading: () => <BannerSkeleton />,
});

export const LazyHomeCategories = dynamic(() => import("./HomeCategories"), {
  loading: () => <CategorySkeleton count={6} />,
});

export const LazyOrderCard = dynamic(() => import("./OrderCard"), {
  loading: () => <OrderCardSkeleton />,
});

export const LazyShop = dynamic(() => import("./Shop"), {
  loading: () => <ProductGridSkeleton count={12} />,
  ssr: false,
});

export const LazyWishListProducts = dynamic(() => import("./WishListProducts"), {
  loading: () => <ProductGridSkeleton count={4} />,
  ssr: false,
});

export const LazyFooter = dynamic(() => import("./Footer"), {
  loading: () => (
    <div className="animate-pulse bg-gray-100 h-64 w-full" />
  ),
});

export const LazyLatestBlog = dynamic(() => import("./LatestBlog"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64" />
      ))}
    </div>
  ),
});

export const LazyShopByBrands = dynamic(() => import("./ShopByBrands"), {
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24" />
      ))}
    </div>
  ),
});

// Cart components
export const LazyCartContent = dynamic(
  () => import("./EmptyCart").then((mod) => ({ default: mod.default })),
  {
    loading: () => <CartSkeleton count={3} />,
    ssr: false,
  }
);
