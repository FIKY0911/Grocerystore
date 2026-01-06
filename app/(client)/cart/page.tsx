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
import { writeClient } from "@/sanity/lib/writeClient";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import { ShoppingBag, Trash, Edit, Plus, Trash2 } from "lucide-react";
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
  const [initialLoading, setInitialLoading] = useState(true);
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
    try {
      const query = `*[_type=="address" && (archived != true || !defined(archived))] | order(default desc, createdAt desc)`;
      const data = await client.fetch(query);
      setAddresses(data);
      
      // Jika ada selected address, cek apakah masih ada di data baru
      if (selectedAddress) {
        const stillExists = data.find((addr: Address) => addr._id === selectedAddress._id);
        if (stillExists) {
          // Update dengan data terbaru
          setSelectedAddress(stillExists);
        } else {
          // Jika dihapus, pilih default atau yang pertama
          const defaultAddress = data.find((addr: Address) => addr.default);
          setSelectedAddress(defaultAddress || data[0] || null);
        }
      } else {
        // Jika belum ada selected, pilih default atau yang pertama
        const defaultAddress = data.find((addr: Address) => addr.default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (data.length > 0) {
          setSelectedAddress(data[0]);
        }
      }
    } catch (error) {
      console.error("Addresses fetching error:", error);
      // Jangan tampilkan toast error saat auto-refresh
      if (!addresses) {
        toast.error("Gagal mengambil data alamat.");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchShippers();

    // Setup polling untuk auto-refresh addresses setiap 5 detik
    const addressInterval = setInterval(() => {
      fetchAddresses();
    }, 5000);

    // Refresh saat window focus (user kembali ke tab)
    const handleFocus = () => {
      fetchAddresses();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup interval dan event listener saat component unmount
    return () => {
      clearInterval(addressInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleResetCart = () => {
    const confirmed = window.confirm("Apakah Anda yakin ingin mereset keranjang?");
    if (confirmed) {
      resetCart();
      toast.success("Keranjang berhasil direset!");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      // Cek apakah address digunakan di order
      const ordersUsingAddress = await client.fetch(
        `*[_type == "order" && references($addressId)]`,
        { addressId }
      );

      if (ordersUsingAddress.length > 0) {
        const shouldDisable = window.confirm(
          `Alamat ini digunakan di ${ordersUsingAddress.length} pesanan.\n\nNonaktifkan alamat ini? (Data pesanan tetap aman)`
        );
        
        if (shouldDisable) {
          await writeClient
            .patch(addressId)
            .set({ 
              archived: true,
              default: false 
            })
            .commit();
          
          toast.success("Alamat berhasil dinonaktifkan");
          fetchAddresses();
        }
        return;
      }

      const confirmDelete = window.confirm(
        "Yakin ingin menghapus alamat ini?"
      );
      
      if (!confirmDelete) return;

      await writeClient.delete(addressId);
      toast.success("Alamat berhasil dihapus");
      fetchAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error("Gagal menghapus alamat");
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {isSignedIn ? (
        <Container className="pb-32 md:pb-0">
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
                          className="w-full rounded-full font-semibold tracking-wide hoverEffect bg-[#00c600] hover:bg-[#00a800] text-white"
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
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Alamat Pengiriman</CardTitle>
                            {!initialLoading && (
                              <span className="text-xs text-gray-400">
                                Auto-refresh aktif
                              </span>
                            )}
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
                                  className={`flex items-start space-x-2 mb-4 p-3 rounded-lg border ${
                                    selectedAddress?._id === address?._id 
                                      ? "border-shop_dark_green bg-shop_light_green/5" 
                                      : "border-gray-200"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={address?._id.toString()}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <Label
                                      htmlFor={`address-${address?._id}`}
                                      className="grid gap-1.5 cursor-pointer"
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
                                  <div className="flex gap-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/address/edit/${address._id}`)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit alamat</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address._id)}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Hapus alamat</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                            <Button
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => router.push("/address")}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Alamat Baru
                            </Button>
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
                <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white shadow-2xl border-t z-50">
                  <div className="p-4">
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
                        className="w-full rounded-full font-semibold tracking-wide hoverEffect bg-[#00c600] hover:bg-[#00a800] text-white"
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
