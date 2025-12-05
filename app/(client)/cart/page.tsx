"use client";

import { Metadata, createCheckoutSession } from "@/action/createCheckoutSession";
import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import { Title } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Address } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartPage = () => {
  const router = useRouter();
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItems());
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippers, setShippers] = useState<any[] | null>(null);
  const [selectedShipper, setSelectedShipper] = useState<any | null>(null);

  const fetchShippers = async () => {
    try {
      const query = `*[_type=="shipper" && isActive == true] | order(name asc)`;
      const data = await client.fetch(query);
      setShippers(data);
      if (data.length > 0) {
        setSelectedShipper(data[0]);
      }
    } catch (error) {
      console.error("Shippers fetching error:", error);
      toast.error("Gagal mengambil data jasa pengiriman.");
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address"] | order(publishedAt desc)`;
      const data = await client.fetch(query);
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.error("Addresses fetching error:", error);
      toast.error("Gagal mengambil data alamat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchShippers();
  }, []);

  const handleResetCart = () => {
    const confirmed = window.confirm("Apakah Anda yakin ingin mereset keranjang?");
    if (confirmed) {
      resetCart();
      toast.success("Keranjang berhasil direset!");
    }
  };

  const handleCheckout = async () => {
    // Validasi
    if (!user) {
      toast.error("Silakan login dulu!");
      return;
    }

    if (!selectedAddress) {
      toast.error("Pilih atau tambahkan alamat pengiriman!");
      return;
    }

    if (!selectedShipper) {
      toast.error("Pilih jasa pengiriman!");
      return;
    }

    if (groupedItems.length === 0) {
      toast.error("Keranjang Anda kosong!");
      return;
    }

    setLoading(true);
    try {
      // Generate order number
      const orderNumber = `order_${crypto.randomUUID()}`;
      
      const metadata: Metadata = {
        orderNumber: orderNumber,
        customerName: user.fullName ?? "Pelanggan",
        customerEmail: user.emailAddresses?.[0]?.emailAddress ?? "",
        clerkUserId: user.id,
        address: selectedAddress,
        shipperId: selectedShipper?._id,
      };

      console.log('🛒 Cart items:', groupedItems.length);
      console.log('📦 Cart details:', groupedItems.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })));
      console.log('📦 Creating order:', orderNumber);

      // Panggil server action untuk create invoice
      const { orderNumber: returnedOrderNumber, paymentUrl } = await createCheckoutSession(
        groupedItems,
        metadata
      );

      if (returnedOrderNumber && paymentUrl) {
        console.log('✅ Order created:', returnedOrderNumber);
        console.log('💳 Payment URL:', paymentUrl);
        
        // Clear cart setelah berhasil create order
        resetCart();
        
        // Show success message
        toast.success("Pesanan berhasil dibuat!");
        
        // Redirect ke success page dengan orderNumber
        setTimeout(() => {
          router.push(`/success?orderNumber=${returnedOrderNumber}`);
        }, 1000);
      } else {
        toast.error("Gagal mendapatkan payment URL dari Xendit.");
        console.error('Missing data:', { returnedOrderNumber, paymentUrl });
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Gagal memulai pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              <div className="flex items-center gap-2 py-5">
                <ShoppingBag className="text-darkColor" />
                <Title>Shopping Cart</Title>
              </div>
              <div className="grid lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2 rounded-lg">
                  <div className="border bg-white rounded-md">
                    {groupedItems?.map(({ product, quantity }) => {
                      const itemCount = getItemCount(product?._id);
                      return (
                        <div
                          key={product?._id}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group"
                              >
                                <Image
                                  src={urlFor(product?.images[0]).url()}
                                  alt="productImage"
                                  width={500}
                                  height={500}
                                  loading="lazy"
                                  className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 hoverEffect"
                                />
                              </Link>
                            )}
                            <div className="h-full flex flex-1 flex-col justify-between py-1">
                              <div className="flex flex-col gap-0.5 md:gap-1.5">
                                <h2 className="text-base font-semibold line-clamp-1">
                                  {product?.name}
                                </h2>
                                <p className="text-sm capitalize">
                                  Variant:{" "}
                                  <span className="font-semibold">
                                    {product?.variant}
                                  </span>
                                </p>
                                <p className="text-sm capitalize">
                                  Status:{" "}
                                  <span className="font-semibold">
                                    {product?.status}
                                  </span>
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ProductSideMenu
                                        product={product}
                                        className="p-2 rounded-full hover:bg-[#00c600]/10 text-[#00c600] transition-colors"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>Tambah ke Favorit</TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => {
                                          deleteCartProduct(product?._id);
                                          toast.success("Produk dihapus!");
                                        }}
                                        className="p-2 rounded-full text-[#9f9fa8] hover:bg-[#ff5353]/10 hover:text-[#ff5353] transition-colors"
                                        aria-label="Hapus item"
                                      >
                                        <Trash size={18} />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Hapus item</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className="font-bold text-lg"
                            />
                            <QuantityButtons product={product} quantity={quantity} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-6">
                      <Button
                        onClick={handleResetCart}
                        variant="outline"
                        className="w-full font-medium text-[#ff5353] hover:bg-[#ff5353]/10 border-[#ff5353]/30"
                      >
                        Kosongkan Keranjang
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lg:col-span-1">
                    <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">
                        Ringkasan Pesanan
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>SubTotal</span>
                          <PriceFormatter amount={getSubTotalPrice()} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Diskon</span>
                          <PriceFormatter
                            amount={getSubTotalPrice() - getTotalPrice()}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Total</span>
                          <PriceFormatter
                            amount={getTotalPrice()}
                            className="text-lg font-bold text-black"
                          />
                        </div>
                        <Button
                          className="w-full rounded-full font-semibold tracking-wide hoverEffect"
                          size="lg"
                          disabled={loading}
                          onClick={handleCheckout}
                        >
                          {loading ? "Mohon tunggu..." : "Buat Invoice Pembayaran"}
                        </Button>
                      </div>
                    </div>
                    {addresses && (
                      <div className="bg-white rounded-md mt-5">
                        <Card>
                          <CardHeader>
                            <CardTitle>Alamat Pengiriman</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              defaultValue={addresses
                                ?.find((addr) => addr.default)
                                ?._id.toString()}
                              onValueChange={(value) => {
                                const address = addresses.find(addr => addr._id.toString() === value);
                                if (address) {
                                  setSelectedAddress(address);
                                }
                              }}
                            >
                              {addresses?.map((address) => (
                                <div
                                  key={address?._id}
                                  className={`flex items-center space-x-2 mb-4 cursor-pointer ${selectedAddress?._id === address?._id && "text-shop_dark_green"}`}
                                >
                                  <RadioGroupItem
                                    value={address?._id.toString()}
                                  />
                                  <Label
                                    htmlFor={`address-${address?._id}`}
                                    className="grid gap-1.5 flex-1 cursor-pointer"
                                  >
                                    <span className="font-semibold">
                                      {address?.name}
                                    </span>
                                    <span className="text-sm text-black/60">
                                      {address.address}, {address.city},{" "}
                                      {address.state} {address.zip}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <Link href="/address">
                              <Button variant="outline" className="w-full mt-4">
                                Tambah Alamat Baru
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    {shippers && (
                      <div className="bg-white rounded-md mt-5">
                        <Card>
                          <CardHeader>
                            <CardTitle>Jasa Pengiriman</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              defaultValue={shippers?.[0]?._id.toString()}
                              onValueChange={(value) => {
                                const shipper = shippers.find(shpr => shpr._id.toString() === value);
                                if (shipper) {
                                  setSelectedShipper(shipper);
                                }
                              }}
                            >
                              {shippers?.map((shipper) => (
                                <div
                                  key={shipper?._id}
                                  className={`flex items-center space-x-2 mb-4 cursor-pointer ${selectedShipper?._id === shipper?._id && "text-shop_dark_green"}`}
                                >
                                  <RadioGroupItem value={shipper?._id.toString()} />
                                  <Label
                                    htmlFor={`shipper-${shipper?._id}`}
                                    className="grid gap-1.5 flex-1 cursor-pointer"
                                  >
                                    <span className="font-semibold">
                                      {shipper?.name}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order summary for mobile view */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2 shadow-lg">
                  <div className="bg-white p-4 rounded-lg border mx-4 mb-4">
                    <h2 className="font-semibold mb-3">Ringkasan Pesanan</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>SubTotal</span>
                        <PriceFormatter amount={getSubTotalPrice()} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Diskon</span>
                        <PriceFormatter
                          amount={getSubTotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="font-bold text-black"
                        />
                      </div>
                      <Button
                        className="w-full rounded-full font-semibold tracking-wide hoverEffect"
                        size="lg"
                        disabled={loading}
                        onClick={handleCheckout}
                      >
                        {loading ? "Mohon tunggu..." : "Buat Invoice Pembayaran"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
