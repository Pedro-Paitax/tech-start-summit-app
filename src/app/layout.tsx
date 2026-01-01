import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tech Start Summit",
  description: "Agenda e Inscrição",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}