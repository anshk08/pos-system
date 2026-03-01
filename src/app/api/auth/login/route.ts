import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const adminEmail = "testadmin@testpos.com";
const adminPassword = "testpassword";

interface StoredUser {
  email: string;
  passwordHash: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    if (email === adminEmail && password === adminPassword) {
      const response = NextResponse.json(
        { email, role: "admin" },
        { status: 200 },
      );

      response.cookies.set("auth", `${email}:admin`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    let users: StoredUser[] = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      { email, role: "user" },
      { status: 200 },
    );

    response.cookies.set("auth", `${email}:user`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
