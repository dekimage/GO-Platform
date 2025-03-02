"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Download, Music, Image, Code, Video, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/firebase";

export default function PackageDetailPage({ params }) {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/login");
          return;
        }

        const idToken = await user.getIdToken();
        const response = await fetch(`/api/packages/${slug}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError(
              "You don't have access to this package. Please subscribe to unlock it."
            );
          } else {
            setError("Failed to load package data. Please try again later.");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPackageData(data.package);
      } catch (err) {
        console.error("Error fetching package:", err);
        setError(
          "An error occurred while loading the package. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [slug, router]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-10">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>

        <Card className="p-6 text-center">
          <div className="text-destructive mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="text-xl font-bold">{error}</h2>
          </div>
          <Button asChild>
            <Link href="/pricing">View Subscription Options</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!packageData) {
    return null;
  }

  const getAssetIcon = (type) => {
    switch (type.toLowerCase()) {
      case "music":
        return <Music className="h-5 w-5" />;
      case "art":
        return <Image className="h-5 w-5" />;
      case "code":
        return <Code className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-[300px] w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={packageData.coverImage}
              alt={packageData.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{packageData.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">
              {packageData.month} {packageData.year}
            </Badge>
            <Badge variant="secondary">{packageData.theme}</Badge>
          </div>

          <p className="text-muted-foreground mb-6">
            {packageData.description}
          </p>

          <Separator className="my-6" />

          <h2 className="text-2xl font-bold mb-4">Package Contents</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packageData.assets.map((asset, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src={asset.image}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getAssetIcon(asset.type)}
                    <Badge variant="outline" className="capitalize">
                      {asset.type}
                    </Badge>
                  </div>

                  <h3 className="font-bold mb-1">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {asset.description}
                  </p>

                  <Button asChild className="w-full">
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6"></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
