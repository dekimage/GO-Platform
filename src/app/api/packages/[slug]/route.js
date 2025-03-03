import { NextResponse } from "next/server";
import { auth as adminAuth } from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request, { params }) {
  try {
    const { slug } = params;

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

    // Get the package
    const packagesSnapshot = await db
      .collection("packages")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (packagesSnapshot.empty) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const packageData = {
      id: packagesSnapshot.docs[0].id,
      ...packagesSnapshot.docs[0].data(),
    };

    // Get the user to check if they have access to this package
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Check if the user is an admin or has this package unlocked
    const isAdmin = userData.admin === true;
    const hasPackageUnlocked =
      Array.isArray(userData.unlockedPackages) &&
      userData.unlockedPackages.includes(packageData.id);

    if (!isAdmin && !hasPackageUnlocked) {
      return NextResponse.json(
        { error: "You don't have access to this package" },
        { status: 403 }
      );
    }

    return NextResponse.json({ package: packageData });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}
