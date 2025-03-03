export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth as adminAuth } from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

export async function GET(request, res) {
  try {
    getFirebaseAdminApp();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth().verifyIdToken(token);

    // ✅ Check admin status from Firebase Auth custom claims
    if (decodedToken.admin !== true) {
      return NextResponse.json(
        { error: "Forbidden: User is not an admin" },
        { status: 403 }
      );
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
