"use client";

import {
  Footprints,
  Shirt,
  ShoppingBasket,
  Car,
  Briefcase,
  Phone,
  Computer,
  Bike,
  Watch,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const categoriesList = [
  { name: "Tout", icon: <ShoppingBasket className="w-4 h-4" />, slug: "all" },
  { name: "Habillement", icon: <Shirt className="w-4 h-4" />, slug: "habillement" },
  { name: "Chaussures", icon: <Footprints className="w-4 h-4" />, slug: "chaussures" },
  { name: "Sacs", icon: <Briefcase className="w-4 h-4" />, slug: "sacs" },
  { name: "Accessoires", icon: <Watch className="w-4 h-4" />, slug: "accessoires" },
  { name: "Téléphones", icon: <Phone className="w-4 h-4" />, slug: "telephones" },
  { name: "Informatique", icon: <Computer className="w-4 h-4" />, slug: "informatique" },
  { name: "Voitures", icon: <Car className="w-4 h-4" />, slug: "voitures" },
  { name: "Motos", icon: <Bike className="w-4 h-4" />, slug: "motos" },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "all";

  const handleChangeCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 bg-gray-100 p-2 rounded-lg mb-4 text-sm">
      {categoriesList.map((category) => (
        <div
          key={category.slug}
          className={`flex items-center justify-center gap-2 cursor-pointer px-2 py-1 rounded-md ${
            category.slug === selectedCategory ? "bg-white" : "text-gray-500"
          }`}
          onClick={() => handleChangeCategory(category.slug)}
        >
          {category.icon}
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default Categories;
