"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus } from "lucide-react";

export function ProductBrowser() {
  const products = useProductStore((state) => state.products);
  const { addToCart, items, updateQuantity, removeFromCart } = useCartStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return products;
    }

    const lowerSearch = debouncedSearch.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.description.toLowerCase().includes(lowerSearch),
    );
  }, [products, debouncedSearch]);

  const getCartItem = (productId: string) =>
    items.find((item) => item.id === productId);

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handleIncrease = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const cartItem = getCartItem(productId);
    if (product && cartItem && cartItem.quantity < product.stock) {
      updateQuantity(productId, cartItem.quantity + 1);
    }
  };

  const handleDecrease = (productId: string) => {
    const cartItem = getCartItem(productId);
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(productId);
      } else {
        updateQuantity(productId, cartItem.quantity - 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Search products by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No products match your search</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const cartItem = getCartItem(product.id);
            const inCart = !!cartItem;
            const atStockLimit = inCart && cartItem.quantity >= product.stock;

            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-80 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-4 mt-auto">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {inCart ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                        <span className="text-sm font-semibold text-green-700">
                          In cart
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDecrease(product.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">
                            {cartItem.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleIncrease(product.id)}
                            disabled={atStockLimit}
                            title={
                              atStockLimit ? "Maximum stock reached" : undefined
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {atStockLimit && (
                        <p className="text-xs text-amber-600 mt-1 text-center">
                          Max stock reached
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
