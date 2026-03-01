import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { CartItem } from "@/store/cartStore";

const CART_FILE = path.join(process.cwd(), "data", "cart.json");

type CartData = Record<string, CartItem[]>;

function getUserFromCookie(request: NextRequest): string | null {
  const auth = request.cookies.get("auth")?.value;
  if (!auth) return null;
  const [email] = auth.split(":");
  return email || null;
}

async function readCarts(): Promise<CartData> {
  try {
    const data = await fs.readFile(CART_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeCarts(carts: CartData): Promise<void> {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2));
}

export async function GET(request: NextRequest) {
  const email = getUserFromCookie(request);
  if (!email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const carts = await readCarts();
    return NextResponse.json(carts[email] ?? []);
  } catch (error) {
    console.error("Failed to read cart:", error);
    return NextResponse.json(
      { message: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const email = getUserFromCookie(request);
  if (!email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const items: CartItem[] = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { message: "Invalid cart data" },
        { status: 400 },
      );
    }

    const carts = await readCarts();
    carts[email] = items;
    await writeCarts(carts);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to update cart:", error);
    return NextResponse.json(
      { message: "Failed to update cart" },
      { status: 500 },
    );
  }
}
