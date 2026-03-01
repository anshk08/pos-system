import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Product } from "@/types/product";

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json");

async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeProducts(products: Product[]): Promise<void> {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    delete updates.id;

    if (
      updates.price != null &&
      (typeof updates.price !== "number" || updates.price < 0)
    ) {
      return NextResponse.json(
        { message: "price must be a non-negative number" },
        { status: 400 },
      );
    }

    if (
      updates.stock != null &&
      (typeof updates.stock !== "number" ||
        updates.stock < 0 ||
        !Number.isInteger(updates.stock))
    ) {
      return NextResponse.json(
        { message: "stock must be a non-negative integer" },
        { status: 400 },
      );
    }

    const products = await readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;
    await writeProducts(products);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const products = await readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    products.splice(index, 1);
    await writeProducts(products);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
