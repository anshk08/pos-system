import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

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

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    await fs.mkdir("data", { recursive: true });

    let users: StoredUser[] = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    } catch {
      users = [];
    }

    if (users.some((u) => u.email === email)) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    users.push({ email, passwordHash });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    const response = NextResponse.json(
      { email, role: "user" },
      { status: 201 },
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
