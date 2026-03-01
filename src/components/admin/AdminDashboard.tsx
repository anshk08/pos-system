"use client";

import { useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";

export function AdminDashboard() {
  const products = useProductStore((state) => state.products);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId)
    : undefined;

  const totalProducts = products.length;

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (productId: string) => {
    setEditingProductId(productId);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingProductId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products ({totalProducts})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductList onEdit={handleOpenEdit} />

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="max-w-[90dvw] sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {editingProduct
                ? "Update the details of the existing product."
                : "Fill in the details to add a new product."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ProductForm
            initialProduct={editingProduct}
            onSubmit={handleClose}
            onCancel={handleClose}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
