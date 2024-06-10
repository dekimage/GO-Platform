"use client";
import Image from "next/image";
import { TitleDescription } from "../page";
import {
  Cat,
  ChevronRight,
  Clock,
  Droplet,
  Edit,
  Ghost,
  Lock,
  Mountain,
  Pencil,
  Shell,
  WalletCards,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MobxStore from "@/mobx";
import { observer } from "mobx-react";

import { Progress } from "@/components/ui/progress";
import profileImg from "@/assets/01.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FaBriefcaseMedical } from "react-icons/fa";

const userLevelPerClass = {
  Asir: {
    lvl: 4,
    xp: 100,
    xpToNextLevel: 200,
    color: "#FCC65E",
    getIcon: (color) => <Zap size={14} color={color} />,
  },
  Vidir: {
    lvl: 2,
    xp: 50,
    xpToNextLevel: 100,
    color: "#7970FF",
    getIcon: (color) => <Droplet size={14} color={color} />,
  },
  Monk: {
    lvl: 1,
    xp: 10,
    xpToNextLevel: 50,
    color: "#F4475E",
    getIcon: (color) => <Mountain size={14} color={color} />,
  },
  Shaman: {
    lvl: 3,
    xp: 80,
    xpToNextLevel: 150,
    color: "#C8D7FF",
    getIcon: (color) => <Cat size={14} color={color} />,
  },
  Vrach: {
    lvl: 5,
    xp: 150,
    xpToNextLevel: 250,
    color: "#7B7E9E",
    getIcon: (color) => <FaBriefcaseMedical size={14} color={color} />,
  },
  Bard: {
    lvl: 6,
    xp: 200,
    xpToNextLevel: 300,
    color: "#D37DED",
    getIcon: (color) => <Ghost size={14} color={color} />,
  },
};

const CreateListDialog = ({ username }) => {
  const [userName, setUserName] = useState(username || "");
  const { updateUser } = MobxStore;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center ml-1 cursor-pointer">
          <Pencil size={14} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Name</DialogTitle>
          <DialogDescription>
            Change how you want your name to appear.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder={userName}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {
              updateUser({ name: userName });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const userClassesArray = Object.entries(userLevelPerClass).map(
  ([name, details]) => ({
    name,
    ...details,
  })
);

const LessonsPage = observer(() => {
  const { user } = MobxStore;

  if (!user) return null;

  return (
    <div className="flex flex-col items-center m-4 sm:mx-8 max-w-[600px] sm:items-start">
      <TitleDescription title="Profile" description="Your Stats" />
      <div className="flex justify-center items-center gap-3 flex-col mb-8 relative">
        <Image
          src={profileImg}
          width={150}
          height={150}
          alt="Profile"
          className="rounded-full"
        />
        <div className="top-0 right-0 bg-foreground border text-background  absolute rounded-full flex justify-center items-center w-8 h-8 cursor-pointer">
          <Pencil size={14} />
        </div>
        <div className="text-2xl font-bold flex">
          {user.name} <CreateListDialog username={user.name} />
        </div>
        <div className="text-md font-bold">Level: {user && user.level}</div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row mb-8">
        <Card className="py-2 px-2 w-64">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-between w-full flex-col">
              <div className="flex justify-between items-between w-full">
                <div> Total Sessions</div>
                <div className="flex justify-center items-center border border-slate-200 p-1 rounded w-8 h-8">
                  <Shell size="16px" />
                </div>
              </div>
              <div className="text-2xl flex items-center">5</div>
            </div>
          </div>
        </Card>

        <Card className="py-2 px-2 w-64">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-between w-full flex-col">
              <div className="flex justify-between items-between w-full">
                <div> Total Minutes</div>
                <div className="flex justify-center items-center border border-slate-200 p-1 rounded w-8 h-8">
                  <Clock size="16px" />
                </div>
              </div>
              <div className="text-2xl flex items-center">195</div>
            </div>
          </div>
        </Card>
      </div>

      <TitleDescription
        title="Classes"
        description="Your progress across 6 classes."
      />

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {userClassesArray
          .sort((a, b) => b.lvl - a.lvl || b.xp - a.xp)
          .map((userClass, i) => {
            const { name, lvl, xp, xpToNextLevel, color, getIcon } = userClass;
            const progress = (xp / (xp + xpToNextLevel)) * 100;

            return (
              <Card
                key={i}
                className="py-2 px-2 w-32 flex flex-col items-center"
              >
                {getIcon(color)}

                <div className={`text-xl font-bold text-[${color}]`}>
                  {name}
                </div>
                <div className="font-bold mb-1">Lvl: {lvl}</div>
                <Progress value={progress} />
                <div className="text-xs mt-1 w-full flex justify-center">
                  {xp} / {xpToNextLevel}
                </div>
              </Card>
            );
          })}
      </div>

      <div className="border p-4 flex rounded mt-4 justify-between cursor-pointer">
        Learn more about the Classes <ChevronRight />
      </div>
    </div>
  );
});
export default LessonsPage;
