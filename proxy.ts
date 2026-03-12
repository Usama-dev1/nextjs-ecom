import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const cartSessionId = request.cookies.get("CartSessionId")?.value;

  if (!cartSessionId) {
    const genCartId = uuid();
    response.cookies.set({
      name: "CartSessionId",
      value: genCartId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 10,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
