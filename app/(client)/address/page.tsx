// app/address/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { writeClient } from "@/sanity/lib/writeClient";
import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { INDONESIAN_PROVINCES } from "@/lib/indonesia";

export default function AddAddressPage() {
  const router = useRouter();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    shipper: "", // tambahkan shipper
    zip: "",
    default: false,
  });

  const [shippers, setShippers] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil daftar jasa pengiriman dari Sanity
  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "shipper"]{ _id, name }`
        );
        setShippers(data);
      } catch (error) {
        console.error("Gagal ambil daftar kurir:", error);
        toast.error("Gagal memuat daftar jasa pengiriman.");
      }
    };
    fetchShippers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newAddress = {
        _type: "address",
        name: formData.name.trim(),
        email: user?.emailAddresses[0]?.emailAddress || "",
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        shipper: {
          _type: "reference",
          _ref: formData.shipper,
        },
        zip: formData.zip.trim(),
        default: formData.default,
        archived: false,
        createdAt: new Date().toISOString(),
      };

      await writeClient.create(newAddress);
      toast.success("Alamat berhasil ditambahkan!");
      router.push("/cart");
    } catch (error) {
      console.error("Gagal simpan alamat:", error);
      toast.error("Gagal menyimpan alamat. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Alamat Baru</CardTitle>
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
              />
              <Label htmlFor="default">Jadikan alamat utama</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-shop_dark_green hover:bg-shop_dark_green/90 text-white">
                {loading ? "Menyimpan..." : "Simpan Alamat"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
