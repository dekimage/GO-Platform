import { NextResponse } from "next/server";
import { auth as adminAuth } from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split("Bearer ")[1];

    // Initialize Firebase Admin
    getFirebaseAdminApp();
    const db = getFirestore();

    // Verify the token
    const decodedToken = await adminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get the user
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const unlockedPackages = userData.unlockedPackages || [];

    // Get all packages that the user has unlocked
    const packagesSnapshot = await db
      .collection("packages")
      .where(
        "id",
        "in",
        unlockedPackages.length > 0 ? unlockedPackages : ["dummy-id"]
      )
      .get();

    const packages = packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ packages, unlockedPackages });
  } catch (error) {
    console.error("Error fetching user packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch user packages" },
      { status: 500 }
    );
  }
}
