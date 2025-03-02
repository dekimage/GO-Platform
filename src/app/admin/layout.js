"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().admin === true) {
              setIsAdmin(true);
            } else {
              router.push("/");
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            router.push("/");
          }
        } else {
          router.push("/");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // This is a completely separate layout for admin pages
  // It should not include any of the regular site navigation
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <main>{children}</main>
      </div>
    </div>
  );
}
