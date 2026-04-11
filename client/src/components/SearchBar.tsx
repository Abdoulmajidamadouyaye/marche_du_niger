"use client";

import { Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") ?? "";
    const [value, setValue] = useState(query);

    useEffect(() => {
        setValue(query);
    }, [query]);

    const updateQuery = (nextValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = nextValue.trim();

        if (trimmed) {
            params.set("q", trimmed);
        } else {
            params.delete("q");
        }

        const next = params.toString();
        router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateQuery(value);
    };

    const handleClear = () => {
        setValue("");
        updateQuery("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm"
            role="search"
        >
            <Search className="h-4 w-4 shrink-0 text-gray-500" />
            <input
                id="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Effacer la recherche"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </form>
    );
};

export default SearchBar;