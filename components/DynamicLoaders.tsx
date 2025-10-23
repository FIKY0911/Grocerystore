"use client";

import dynamic from "next/dynamic";

const DynamicShopByBrands = dynamic(() => import("@/components/ShopByBrands"), { ssr: false });
const DynamicLatestBlog = dynamic(() => import("@/components/LatestBlog"), { ssr: false });

const DynamicLoaders = () => {
  return (
    <>
      <DynamicShopByBrands />
      <DynamicLatestBlog />
    </>
  );
};

export default DynamicLoaders;
