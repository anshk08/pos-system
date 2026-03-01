"use client";

import { ProductBrowser } from "./ProductBrowser";
import { ShoppingCart } from "./ShoppingCart";
import { useCartStore } from "@/store/cartStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart as CartIcon } from "lucide-react";

export function CustomerView() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <div className="space-y-6">
      <Tabs defaultValue="shop" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shop">Browse Products</TabsTrigger>
          <TabsTrigger value="cart" className="relative">
            <CartIcon className="w-4 h-4 mr-2" />
            Cart
            {itemCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {itemCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <ProductBrowser />
        </TabsContent>

        <TabsContent value="cart">
          <ShoppingCart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
