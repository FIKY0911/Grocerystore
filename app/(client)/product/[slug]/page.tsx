import Container from "@/components/Container";
import FavoriteButton from "@/components/FavoriteButton";
import ImageView from "@/components/ImageView";
import PriceView from "@/components/PriceView";
import { CornerDownLeft, StarIcon, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { RxBorderSplit } from 'react-icons/rx';
import { TbTruckDelivery } from 'react-icons/tb';
import { FiShare2 } from 'react-icons/fi';
import AddToCartButton from "@/components/AddToCartButton";
import { getProductBySlug } from "@/sanity/queries";
import ProductCharacteristics from "@/components/ProductCharacteristic";

const SingleProductPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  return (
    <Container className="flex flex-col md:flex-row gap-12 py-15">
      {/* LEFT IMAGE (lebih lebar: 2/3) */}
      {product?.images && (
        <div className="w-full md:w-2/3 flex items-center justify-center">
            <ImageView images={product?.images} isStock={product?.stock} className="w-full rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden hoverEffect"/>
        </div>
      )}


      {/* RIGHT CONTENT (lebih kecil: 1/3) */}
      <div className="w-full md:w-1/2 flex flex-col gap-7">
        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {product?.name}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product?.description}
          </p>
          <div className="flex items-center gap-1 text-xs">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-shop_light_green"
                fill={"#3b9c3c"}
              />
            ))}
            <p className="ml-1 font-semibold text-gray-700">{`(120)`}</p>
          </div>
        </div>

        {/* PRICE & STOCK */}
        <div className="space-y-3 border-t border-b border-gray-200 py-5">
          <PriceView
            price={product?.price}
            discount={product?.discount}
            className="text-2xl font-bold text-shop_dark_green"
          />
          <span
            className={`px-4 py-1.5 text-sm font-medium rounded-full inline-block ${
              (product?.stock as number) > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {(product?.stock as number) > 0 ? "Stok Tersedia" : "Stok Habis"}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <AddToCartButton
            product={product}
            className="flex-1 h-11 rounded-lg text-white bg-shop_dark_green hover:bg-shop_dark_green/90 transition"
          />
          <FavoriteButton
            showProduct={true}
            product={product}
            className="h-11 w-11 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          />
        </div>

        {/* CHARACTERISTICS */}
        <div className="rounded-xl border border-gray-100 p-4 shadow-sm bg-white">
          <ProductCharacteristics product={product} />
        </div>

        {/* PRODUCT EXTRA ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 py-5 border-t border-b border-gray-200">
          {[
            { icon: <RxBorderSplit />, text: "Compare color" },
            { icon: <FaRegQuestionCircle />, text: "Ask a question" },
            { icon: <TbTruckDelivery />, text: "Delivery & Return" },
            { icon: <FiShare2 />, text: "Share" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-shop_dark_green cursor-pointer transition"
            >
              <span className="text-lg">{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        {/* DELIVERY INFO */}
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-3 p-4">
            <Truck size={28} className="text-shop_orange" />
            <div>
              <p className="font-semibold text-gray-900">Free Delivery</p>
              <p className="text-sm text-gray-500 underline underline-offset-2">
                Enter your Postal code for Delivery Availability.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <CornerDownLeft size={28} className="text-shop_orange" />
            <div>
              <p className="font-semibold text-gray-900">Return Delivery</p>
              <p className="text-sm text-gray-500">
                Free 30 days Delivery Returns.{" "}
                <span className="underline underline-offset-2 cursor-pointer">
                  Details
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SingleProductPage;
