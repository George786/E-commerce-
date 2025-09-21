"use client";

import { Navbar, Footer } from "@/components";
import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Navbar />
      {children}
      <Footer />
    </UserProvider>
  );
}
