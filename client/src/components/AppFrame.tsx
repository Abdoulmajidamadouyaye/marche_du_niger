"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const AppFrame = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto p-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default AppFrame;