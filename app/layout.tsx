// app/layout.tsx
import "./globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Grocerystore",
  description: "Grocerystore online terpercaya",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body className="font-poppins antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#000000",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;
