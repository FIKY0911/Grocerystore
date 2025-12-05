"use client";

import Container from "@/components/Container";
import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Kirim email via EmailJS (client-side)
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      // 2️⃣ Simpan data ke Sanity via API route (server-side)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("Pesan berhasil dikirim dan disimpan!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Gagal menyimpan pesan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-4xl font-bold text-center text-shop_darkColor mb-4">
          Hubungi Kami
        </h1>
        <p className="text-center text-shop_textColor mb-8 max-w-2xl mx-auto">
          Kami senang mendengar dari Anda! Silakan isi formulir di bawah ini.
        </p>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-shop_darkColor mb-6">Kirim Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Subjek</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Pesan</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`bg-shop_btn_dark_green text-black/60 font-semibold px-6 py-2 rounded-md hover:bg-shop_dark_green/80 hover:text-deal-bg transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Mengirim..." : "Kirim"}
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Contact;
