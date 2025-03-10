import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get the package
    const packageQuery = await adminDb
      .collection("packages")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (packageQuery.empty) {
      return Response.json({ error: "Package not found" }, { status: 404 });
    }

    const packageDoc = packageQuery.docs[0];
    const packageData = { id: packageDoc.id, ...packageDoc.data() };

    // Get user data
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    // ONLY check unlockedPackages - no exceptions for anyone!
    const hasPackage = userData?.unlockedPackages?.includes(packageData.id);

    console.log("Access check:", {
      uid,
      packageId: packageData.id,
      unlockedPackages: userData?.unlockedPackages,
      hasPackage,
    });

    if (!hasPackage) {
      return Response.json(
        {
          error: "Access denied",
          message: "You need to purchase this package to access it.",
          requiresPurchase: true,
        },
        { status: 403 }
      );
    }

    return Response.json(packageData);
  } catch (error) {
    console.error("Error fetching package:", error);
    return Response.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}
