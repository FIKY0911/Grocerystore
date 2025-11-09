"use client";

import React, { Suspense } from "react";
import Shop from "@/components/Shop";
import { getAllBrands, getCategories } from "@/sanity/queries";

const ShopPage = () => {
  const [categories, setCategories] = React.useState([]);
  const [brands, setBrands] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [cat, br] = await Promise.all([getCategories(), getAllBrands()]);
      setCategories(cat);
      setBrands(br);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white">
      <Suspense fallback={<div className="p-10 text-center">Loading Shop...</div>}>
        <Shop categories={categories} brands={brands} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
