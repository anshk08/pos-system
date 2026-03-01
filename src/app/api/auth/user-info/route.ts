import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const adminEmail = "testadmin@testpos.com";

interface StoredUser {
  email: string;
  passwordHash: string;
}

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get("auth")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const parts = authCookie.split(":");
    const email = parts[0];
    const role = parts[1] || "user";

    if (role === "admin") {
      if (email === adminEmail) {
        return NextResponse.json({ email, role });
      }
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    let users: StoredUser[] = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    } catch {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ email, role: "user" });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ message: "Auth check failed" }, { status: 500 });
  }
}
