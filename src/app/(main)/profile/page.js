"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ProfileInfo from "@/components/profile/ProfileInfo";
import Downloads from "@/components/profile/Downloads";
import Settings from "@/components/profile/Settings";
import { observer } from "mobx-react-lite";
import MobxStore from "@/mobx";

const ProfilePage = observer(() => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "downloads", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Force a fresh permission check
    MobxStore.checkPermissions(true);

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

  // Log detailed permissions data for debugging
  useEffect(() => {
    console.log("Profile page - Permissions data:", {
      permissions: MobxStore.permissions,
      isAdmin: MobxStore.isAdmin,
      isMember: MobxStore.isMember,
      canAccessPackages: MobxStore.canAccessPackages,
      subscription: MobxStore.permissions?.subscription,
      subscriptionActive: MobxStore.permissions?.subscription?.active,
    });
  }, [MobxStore.permissions]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null;
  }

  console.log("User data:", user);
  console.log("MobX permissions:", MobxStore.permissions);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileInfo
            user={user}
            permissions={MobxStore.permissions}
            isMember={MobxStore.isMember}
            hasActiveSubscription={MobxStore.permissions?.subscription?.active}
          />
        </TabsContent>

        <TabsContent value="downloads">
          <Downloads
            userId={user.id}
            unlockedPackages={user.unlockedPackages || []}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Settings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default ProfilePage;

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
