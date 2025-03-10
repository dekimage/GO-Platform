import { adminDb } from "@/lib/firebase-admin";
import PackageList from "@/components/packages/PackageList";

// This enables Static Site Generation
export const revalidate = 3600; // Revalidate every hour

async function getPackages() {
  const packagesSnapshot = await adminDb.collection("packages").get();

  return packagesSnapshot.docs.map((doc) => {
    const data = doc.data();
    const assets =
      data.assets?.map((asset) => ({
        title: asset.title,
        description: asset.description,
        type: asset.type,
        image: asset.image,
      })) || [];

    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      theme: data.theme,
      month: data.month,
      year: data.year,
      coverImage: data.coverImage,
      slug: data.slug,
      assets,
    };
  });
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Monthly Game Asset Packages</h1>
      <PackageList packages={packages} />
    </div>
  );
}
