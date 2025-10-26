// app/layout.tsx
import "./globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

export const meta Metadata = {
  title: "Grocerystore",
  description: "Grocerystore online terpercaya",
  viewport: "width=device-width, initial-scale=1",
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
        <script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      </body>
    </html>
  );
};

export default RootLayout;
