"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ProfileInfo from "@/components/profile/ProfileInfo";
import Downloads from "@/components/profile/Downloads";
import Settings from "@/components/profile/Settings";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          if (userDoc.exists()) {
            setUser({
              id: authUser.uid,
              email: authUser.email,
              ...userDoc.data(),
            });
          } else {
            // Create a user document if it doesn't exist
            setUser({
              id: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || "",
              profileImage: authUser.photoURL || "",
              unlockedPackages: [],
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null;
  }

  console.log(user);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileInfo user={user} />
        </TabsContent>

        <TabsContent value="downloads" className="mt-6">
          <Downloads
            userId={user.id}
            unlockedPackages={user.unlockedPackages || []}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Settings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container py-10">
      <Skeleton className="h-10 w-48 mb-6" />

      <Skeleton className="h-10 w-[400px] mb-6" />

      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      </Card>
    </div>
  );
}
