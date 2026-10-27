import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);

  // Clear admin cookie
  response.cookies.delete({
    name: "pricora_admin_token",
    path: "/",
  });

  return response;
}
