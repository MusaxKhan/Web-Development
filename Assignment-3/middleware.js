import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rateLimitMap = new Map();

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/socket"
  ) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: Please login" },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.id;
    const role = payload.role?.toLowerCase();

    if (role === "agent") {
      const now = Date.now();
      const requests = rateLimitMap.get(userId) || [];
      const recent = requests.filter((t) => now - t < 60000);

      if (recent.length >= 50) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Agents are limited to 50 requests/min." },
          { status: 429 }
        );
      }

      recent.push(now);
      rateLimitMap.set(userId, recent);
    }

    if (pathname.startsWith("/api/admin") && role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const res = NextResponse.next();
    res.headers.set("x-user-id", userId);
    res.headers.set("x-user-role", role);

    return res;
  } catch (err) {
    console.error("Middleware Auth Error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/((?!auth).*)"],
};
