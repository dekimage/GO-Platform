"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { db, auth } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import SubscriptionStatus from "./SubscriptionStatus";

export default function ProfileInfo({ user }) {
  const [name, setName] = useState(user.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        name: name,
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleImageUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  //   if (!allowedTypes.includes(file.type)) {
  //     toast({
  //       title: "Invalid File",
  //       description: "Please upload a valid image file (JPEG, PNG, or GIF).",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsUploading(true);
  //   try {
  //     const storageRef = ref(storage, `profile-images/${user.id}`);
  //     await uploadBytes(storageRef, file);
  //     const downloadURL = await getDownloadURL(storageRef);

  //     const userRef = doc(db, "users", user.id);
  //     await updateDoc(userRef, {
  //       profileImage: downloadURL,
  //     });

  //     if (auth.currentUser) {
  //       await updateProfile(auth.currentUser, {
  //         photoURL: downloadURL,
  //       });
  //     }

  //     toast({
  //       title: "Image Uploaded",
  //       description: "Your profile image has been updated successfully.",
  //     });

  //     // Force a page refresh to show the new image
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     toast({
  //       title: "Upload Failed",
  //       description: "Failed to upload image. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Manage your personal information and subscription status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative group">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profileImage} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <label
                htmlFor="profile-image"
                className="cursor-pointer text-white text-xs font-medium p-2 text-center"
              >
                {isUploading ? "Uploading..." : "Change Image"}
              </label>
              <input
                id="profile-image"
                type="file"
                className="hidden"
                accept="image/*"
                // onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        <Separator />

        <SubscriptionStatus user={user} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpdateProfile}
          disabled={isUpdating || name === user.name}
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </Button>
      </CardFooter>
    </Card>
  );
}
