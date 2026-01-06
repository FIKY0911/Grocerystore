"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { writeClient } from "@/sanity/lib/writeClient";
import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import Container from "@/components/Container";

interface AddressWithShipper {
  _id: string;
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  default?: boolean;
  shipper?: {
    _id: string;
    name: string;
  };
}

export default function ManageAddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressWithShipper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address" && (archived != true || !defined(archived))] | order(default desc, createdAt desc){
        ...,
        shipper->{
          _id,
          name
        }
      }`;
      const data = await client.fetch(query);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Gagal memuat alamat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (addressId: string) => {
    try {
      // Cek apakah address digunakan di order
      const ordersUsingAddress = await client.fetch(
        `*[_type == "order" && references($addressId)]`,
        { addressId }
      );

      if (ordersUsingAddress.length > 0) {
        // Jika digunakan di order, tawarkan untuk disable instead of delete
        const shouldDisable = window.confirm(
          `Alamat ini digunakan di ${ordersUsingAddress.length} pesanan dan tidak dapat dihapus.\n\nApakah Anda ingin menonaktifkan alamat ini saja? (Alamat akan disembunyikan tapi data pesanan tetap aman)`
        );
        
        if (shouldDisable) {
          // Tandai sebagai inactive/archived
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

      // Jika tidak ada referensi, konfirmasi delete
      const confirmDelete = window.confirm(
        "Yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan."
      );
      
      if (!confirmDelete) return;

      // Hapus address
      await writeClient.delete(addressId);
      toast.success("Alamat berhasil dihapus");
      fetchAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      
      // Handle specific Sanity errors
      if (error.message?.includes("references") || error.message?.includes("cannot be deleted")) {
        toast.error(
          "Alamat ini tidak dapat dihapus karena masih terhubung dengan pesanan. Silakan hubungi admin jika perlu bantuan.",
          { duration: 6000 }
        );
      } else {
        toast.error("Gagal menghapus alamat: " + (error.message || "Terjadi kesalahan"));
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // Set semua address jadi false
      const allAddresses = await client.fetch(`*[_type=="address"]`);
      for (const addr of allAddresses) {
        await writeClient.patch(addr._id).set({ default: false }).commit();
      }

      // Set address yang dipilih jadi true
      await writeClient.patch(addressId).set({ default: true }).commit();
      
      toast.success("Alamat utama berhasil diubah");
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Gagal mengubah alamat utama");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 bg-gray-50">
        <Container className="py-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <Container className="py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Kelola Alamat</h1>
          <Button onClick={() => router.push("/address")} className="bg-shop_dark_green hover:bg-shop_dark_green/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Alamat
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
              <Button onClick={() => router.push("/address")}>
                Tambah Alamat Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address._id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{address.name}</CardTitle>
                        {address.default && (
                          <Badge variant="default" className="bg-shop_dark_green">
                            Utama
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{address.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                      <div className="text-sm">
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                    </div>
                    {address.shipper && (
                      <p className="text-sm text-gray-600 ml-6">
                        Kurir: <span className="font-medium">{address.shipper.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/address/edit/${address._id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {!address.default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                      >
                        Jadikan Utama
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </Container>
    </div>
  );
}

