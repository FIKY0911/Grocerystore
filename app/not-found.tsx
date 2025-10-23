import Logo from "@/components/Logo";
import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 md:py-32">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />

          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Maaf yang anda cari tidak ada?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maaf. Halaman yang anda cari tidak ada di halaman kami.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-shop_dark_green/80 hover:bg-shop_dark_green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazonOrangeDark hoverEffect"
            >
              Kunjungi halaman utama
            </Link>
            <Link
              href="/help"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-amazonBlue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazonBlue"
            >
              Bantuan
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Butuh bantuan? Kunjungi{" "}
            <Link
              href="/help"
              className="font-medium text-amazon-blue hover:text-amazon-blue-dark"
            >
              bagian Bantuan
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-medium text-amazon-blue hover:text-amazon-blue-dark"
            >
              hubungi kami
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
