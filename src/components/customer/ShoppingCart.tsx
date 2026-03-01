"use client";

import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ShoppingCart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const products = useProductStore((state) => state.products);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());

  const getStock = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.stock ?? 0;
  };

  const handleQuantityInput = (productId: string, value: string) => {
    const stock = getStock(productId);
    const parsed = parseInt(value) || 1;
    const clamped = Math.min(parsed, stock);
    updateQuantity(productId, clamped);
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <p className="text-sm text-gray-400">
          Browse products and add items to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const stock = getStock(item.id);
              const atStockLimit = item.quantity >= stock;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{item.name}</div>
                      {atStockLimit && (
                        <div className="text-xs text-amber-600 mt-0.5">
                          Max stock reached ({stock})
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={stock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityInput(item.id, e.target.value)
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.quantity + 1, stock),
                          )
                        }
                        disabled={atStockLimit}
                        title={
                          atStockLimit ? "Maximum stock reached" : undefined
                        }
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex justify-between text-lg">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>Tax (10%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button onClick={clearCart} variant="outline" className="flex-1">
          Clear Cart
        </Button>
        <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
