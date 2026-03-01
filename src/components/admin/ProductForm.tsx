"use client";

import { useState } from "react";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ProductForm({
  initialProduct,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { addProduct, updateProduct } = useProductStore();
  const [formData, setFormData] = useState<Partial<Product>>(
    initialProduct || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image: "",
    },
  );
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("lol");

    if (!formData.name?.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.description?.trim()) {
      setError("Description is required");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (formData.stock === undefined || formData.stock < 0) {
      setError("Stock cannot be negative");
      return;
    }
    if (!formData.image?.trim()) {
      setError("Image URL is required");
      return;
    }

    if (initialProduct) {
      await updateProduct(initialProduct.id, formData);
    } else {
      await addProduct({
        name: formData.name || "",
        description: formData.description || "",
        price: formData.price || 0,
        stock: formData.stock || 0,
        image: formData.image || "",
      });
    }

    if (!initialProduct) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image: "",
      });
    }

    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="e.g., Wireless Mouse"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Describe your product..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price || 0}
            onChange={handleChange}
            placeholder="29.99"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock || 0}
            onChange={handleChange}
            placeholder="10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image || ""}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {initialProduct ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
