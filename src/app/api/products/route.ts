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

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to read products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, image } = body;

    if (!name || !description || price == null || stock == null) {
      return NextResponse.json(
        { message: "name, description, price, and stock are required" },
        { status: 400 },
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { message: "price must be a non-negative number" },
        { status: 400 },
      );
    }

    if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json(
        { message: "stock must be a non-negative integer" },
        { status: 400 },
      );
    }

    const products = await readProducts();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      description,
      price,
      stock,
      image: image || "",
    };

    products.push(newProduct);
    await writeProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
