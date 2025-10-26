// import ContactForm from "@/components/ContactForm";
import Container from "@/components/Container";
import React from "react";

const ContactPage = () => {
  return (
    <Container>
      <div className="py-16">
        <h1 className="text-4xl font-bold text-center text-shop_darkColor mb-4">Hubungi Kami</h1>
        <p className="text-center text-shop_textColor mb-8 max-w-2xl mx-auto">
          Kami senang mendengar dari Anda! Silakan isi formulir di bawah ini atau hubungi kami melalui informasi kontak yang tersedia.
        </p>
        {/* <ContactForm/> */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-shop_darkColor mb-6">Kirim Pesan</h2>
        </div>
      </div>
    </Container>
  );
};

export default ContactPage;
