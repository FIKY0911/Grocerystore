"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { INDONESIAN_PROVINCES } from "@/lib/indonesia";
import Container from "@/components/Container";

export default function EditAddressPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const { user } = useUser();
  const [addressId, setAddressId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    shipper: "",
    zip: "",
    default: false,
  });

  const [shippers, setShippers] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Get params (Next.js 15 requires await)
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setAddressId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fetch address data
  useEffect(() => {
    if (!addressId) return;

    const fetchAddress = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "address" && _id == $id][0]{
            ...,
            "shipperId": shipper->_id
          }`,
          { id: addressId }
        );

        if (data) {
          setFormData({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            shipper: data.shipperId || "",
            zip: data.zip || "",
            default: data.default || false,
          });
        } else {
          toast.error("Alamat tidak ditemukan");
          router.push("/address/manage");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        toast.error("Gagal memuat data alamat");
      } finally {
        setFetching(false);
      }
    };

    fetchAddress();
  }, [addressId, router]);

  // Fetch shippers
  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "shipper"]{ _id, name }`
        );
        setShippers(data);
      } catch (error) {
        console.error("Error fetching shippers:", error);
        toast.error("Gagal memuat daftar jasa pengiriman");
      }
    };
    fetchShippers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔄 Starting update address:", addressId);
    console.log("📝 Form data:", formData);

    try {
      const response = await fetch("/api/address/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId,
          formData: {
            ...formData,
            email: user?.emailAddresses[0]?.emailAddress || "",
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Update successful:", data);
        toast.success("Alamat berhasil diperbarui!");
        
        // Delay sedikit sebelum redirect agar user bisa lihat toast
        setTimeout(() => {
          router.push("/address/manage");
        }, 500);
      } else {
        console.error("❌ Update failed:", data);
        throw new Error(data.message || "Failed to update address");
      }
    } catch (error: any) {
      console.error("❌ Error updating address:", error);
      toast.error(`Gagal memperbarui alamat: ${error.message || "Coba lagi"}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container className="py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-10">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nama Alamat (Contoh: Rumah, Kantor)</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Rumah"
                />
              </div>

              <div>
                <Label>Alamat Lengkap</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Jl. Merdeka No. 10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kota</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Jakarta"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Provinsi</Label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Pilih provinsi</option>
                    {INDONESIAN_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="shipper">Jasa Pengiriman</Label>
                <select
                  id="shipper"
                  name="shipper"
                  value={formData.shipper}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Pilih jasa pengiriman</option>
                  {shippers.map((shipper) => (
                    <option key={shipper._id} value={shipper._id}>
                      {shipper.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Kode Pos</Label>
                <Input
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  placeholder="12345"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  name="default"
                  checked={formData.default}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="default" className="cursor-pointer">
                  Jadikan alamat utama
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-shop_dark_green hover:bg-shop_dark_green/90 text-white">
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/address/manage")}
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
