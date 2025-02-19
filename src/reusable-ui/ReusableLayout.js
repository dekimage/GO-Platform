"use client";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { VerticalNavbar } from "./VerticalNavbar";

import { PackageSearch, Ticket, UserIcon } from "lucide-react";
import MobxStore from "../mobx";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { observer } from "mobx-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { UserNav } from "./ReusableProfileMenu";
import Image from "next/image";
import logoImg from "../assets/logo.png";

import MobileHeader from "./MobileHeader";

import { ModeToggle } from "@/components/ui/themeButton";

const defaultLayout = [20, 80];

const ReusableLayout = observer(({ children }) => {
  const { user, logout } = MobxStore;

  const pathname = usePathname();
  const isRoute = (route) => {
    if (route === "/") {
      return pathname.toLowerCase() === `${route.toLowerCase()}`
        ? "default"
        : "ghost";
    }

    return pathname.toLowerCase().includes(route.toLowerCase())
      ? "default"
      : "ghost";
  };

  return (
    <div>
      <div className="hidden sm:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full max-h-[950px] items-stretch"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            maxSize={20}
            className="max-w-[200px] min-w-[200px] h-[950px]"
          >
            <Link href="/" className="cursor-pointer">
              <div className="flex h-[52px] items-center justify-center px-2">
                <Image src={logoImg} width={32} height={32} alt="logo" />
                <div className="text-2xl font-bold ml-1">Galactic Omnivore</div>
              </div>
            </Link>
            <Separator />
            <VerticalNavbar
              links={[
                {
                  title: "Dashboard",
                  icon: Ticket,
                  variant: isRoute("/"),
                  href: "",
                },
                {
                  title: "Products",
                  icon: PackageSearch,
                  variant: isRoute("products"),
                  href: "products",
                },
                {
                  title: "Profile",
                  icon: UserIcon,
                  variant: isRoute(`user/${MobxStore.user?.uid}`),
                  href: `user/${MobxStore.user?.uid}`,
                },
              ]}
            />
          </ResizablePanel>
          {/* <ResizableHandle /> */}
          <ResizablePanel
            className="border-l border-gray-[#e5e7eb]"
            defaultSize={defaultLayout[1]}
            minSize={30}
            style={{ overflow: "auto" }}
          >
            <div>
              <div className="w-full h-[53px] flex justify-end items-center p-2 border-b  gap-4">
                {/* <Input
                  // type="search"
                  placeholder="Search..."
                  className="md:w-[100px] lg:w-[300px]"
                  icon={<Search size={16} />}
                /> */}

                <ModeToggle />
                {user ? (
                  <>
                    <div>${user.balance}</div>
                    <UserNav user={user} logout={logout} />
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Create Free Account</Button>
                    </Link>
                  </div>
                )}
              </div>
              <div className="">{children}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="block sm:hidden">
        <MobileHeader />
        {children}
      </div>
    </div>
  );
});

export default ReusableLayout;
