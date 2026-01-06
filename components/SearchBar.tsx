"use client";

import { Search, X, Clock, TrendingUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import PriceView from "./PriceView";

// Interface untuk search result
interface SearchProduct {
  _id: string;
  name?: string;
  slug?: string; // slug sudah string dari query
  images?: Product["images"];
  description?: string;
  price?: number;
  discount?: number;
  stock?: number;
  status?: Product["status"];
  variant?: Product["variant"];
}

// Kata kunci populer untuk suggestion
const POPULAR_KEYWORDS = [
  "sayuran segar",
  "bumbu dapur",
  "daging",
  "cabai",
  "bawang",
  "tomat",
  "kentang",
  "wortel",
  "ayam",
  "sapi",
  "ikan",
  "telur",
];

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  // Load recent searches dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate suggestions berdasarkan input
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Filter kata kunci populer yang cocok
    const matchedKeywords = POPULAR_KEYWORDS.filter((keyword) =>
      keyword.toLowerCase().includes(term)
    );

    // Filter dari recent searches
    const matchedRecent = recentSearches.filter((search) =>
      search.toLowerCase().includes(term) && search.toLowerCase() !== term
    );

    // Gabungkan dan ambil max 5 suggestions
    const combined = [...new Set([...matchedRecent, ...matchedKeywords])].slice(0, 5);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
  }, [searchTerm, recentSearches]);

  // Debounce search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Error searching:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Save to recent searches
  const saveToRecentSearches = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    saveToRecentSearches(suggestion);
  };

  const handleProductClick = (slug: string) => {
    if (searchTerm.trim()) {
      saveToRecentSearches(searchTerm);
    }
    setIsOpen(false);
    setSearchTerm("");
    setResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/product/${slug}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        <Search className="w-5 h-5 hover:text-shop_light_green hoverEffect" />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Cari Produk</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setResults([]);
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pencarian Terakhir
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Keywords */}
          {!searchTerm && recentSearches.length === 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                Pencarian Populer
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.slice(0, 8).map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(keyword)}
                    className="px-3 py-1.5 text-sm bg-shop_light_green/10 hover:bg-shop_light_green/20 text-shop_dark_green rounded-full transition"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shop_dark_green"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product.slug!)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    {product.images && product.images[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={urlFor(product.images[0]).url()}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                      <PriceView
                        price={product.price}
                        discount={product.discount}
                        className="text-sm font-semibold text-shop_dark_green mt-1"
                      />
                    </div>
                    {product.stock && product.stock > 0 ? (
                      <span className="text-xs text-green-600 font-medium">
                        Tersedia
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        Habis
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada produk ditemukan untuk "{searchTerm}"</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Ketik untuk mencari produk</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBar;
