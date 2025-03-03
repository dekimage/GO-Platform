"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { ModeToggle } from "./ui/themeButton";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Don't render the header on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path) => {
    return pathname === path ? "default" : "ghost";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Galactic Omnivore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <Button asChild variant={isActive("/")} size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant={isActive("/products")} size="sm">
              <Link href="/products">Products</Link>
            </Button>
            <Button asChild variant={isActive("/pricing")} size="sm">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild variant={isActive("/blog")} size="sm">
              <Link href="/blog">Blog</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                      />
                      <AvatarFallback>
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=downloads">Downloads</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-2">
            <Button asChild variant={isActive("/")} className="justify-start">
              <Link href="/">Home</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/products")}
              className="justify-start"
            >
              <Link href="/products">Products</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/pricing")}
              className="justify-start"
            >
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/blog")}
              className="justify-start"
            >
              <Link href="/blog">Blog</Link>
            </Button>
            {user && (
              <Button
                asChild
                variant={isActive("/profile")}
                className="justify-start"
              >
                <Link href="/profile">Profile</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
