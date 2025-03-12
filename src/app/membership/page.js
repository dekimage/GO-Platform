"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import MobxStore from "@/mobx";

const DetailSection = ({
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  children,
}) => (
  <div
    className={`flex flex-col ${
      reverse ? "md:flex-row-reverse" : "md:flex-row"
    } items-center gap-8 py-16`}
  >
    <div className="w-full md:w-1/2">
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={imageAlt}
        width={600}
        height={400}
        className="rounded-lg"
      />
    </div>
    <div className="w-full md:w-1/2">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-lg">{description}</p>
      {children}
    </div>
  </div>
);

const AudioPreview = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = document.getElementById("audio-preview");
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center space-x-4 mt-4">
      <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
      <span>5-second preview</span>
      <audio id="audio-preview" src={src} />
    </div>
  );
};

const YouTubeEmbed = ({ videoId }) => (
  <div className="aspect-w-16 aspect-h-9 mt-4">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full rounded-lg"
    />
  </div>
);

const GameOfTheMonth = () => (
  <div className="py-16 border-b">
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-primary mb-2">
            FEATURED THIS MONTH
          </h2>
          <h3 className="text-3xl font-bold mb-4">Sakura Spirit</h3>
          <p className="text-lg text-muted-foreground mb-6">
            A serene puzzle adventure set in a mystical Japanese garden.
            Navigate through challenging levels while uncovering the secrets of
            the ancient cherry blossoms.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Includes:</h4>
          <ul className="space-y-2">
            {[
              "Complete game with 30+ levels",
              "Thematic art asset pack",
              "Original soundtrack",
              "Source code with documentation",
              "Level design tutorial videos",
              "Particle system implementation guide",
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button size="lg" asChild className="mt-4">
          <Link href="/pricing">
            Become a Member
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="w-full md:w-1/2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop"
            alt="Sakura Spirit Game"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-primary/90 text-white mb-2">
              Game of the Month
            </Badge>
            <p className="text-white text-sm">
              Available exclusively to members
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Badge = ({ children, className }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const MembershipPage = observer(() => {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const isAuthenticated = !!MobxStore.user;

  useEffect(() => {
    const planParam = searchParams.get("plan");
    const storedPlan = localStorage.getItem("selectedPlan");

    if (planParam && ["monthly", "annual"].includes(planParam)) {
      setSelectedPlan(planParam);
      localStorage.setItem("selectedPlan", planParam);
    } else if (storedPlan && ["monthly", "annual"].includes(storedPlan)) {
      setSelectedPlan(storedPlan);
    }

    if (storedPlan) {
      localStorage.removeItem("selectedPlan");
    }
  }, [searchParams]);

  return (
    <div className="bg-background text-foreground">
      <Head>
        <title>Membership - Your Game Dev Community</title>
        <meta
          name="description"
          content="Join our exclusive game development community and get access to monthly themed assets, tutorials, and more!"
        />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <GameOfTheMonth />

        <DetailSection
          title="Theme of the Month Art Packages"
          description="Immerse yourself in our monthly themed art packages. This January, explore the serene beauty of Sakura with cherry blossom-inspired sprites, backgrounds, and UI elements. Perfect for creating atmospheric Japanese-themed games or adding a touch of spring to your projects."
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="January Sakura Theme Art Package Preview"
        />

        <DetailSection
          title="Curated Music Packs"
          description="Set the mood with our professionally composed music packs. Each month features a new theme, providing you with a variety of tracks to enhance your game's atmosphere. Listen to a preview of this month's Sakura-inspired melody:"
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Music Pack Visualizer"
          reverse={true}
        >
          <AudioPreview src="/path-to-audio-file.mp3" />
        </DetailSection>

        <DetailSection
          title="Code Packs & Snippets"
          description="Accelerate your development with our monthly code packs. Get access to optimized algorithms, shaders, and game mechanics tailored to the month's theme. This month, dive into particle systems for cherry blossom effects and smooth camera transitions inspired by Japanese scenery."
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Code Snippet Preview"
        />

        <DetailSection
          title="Instructional Tutorial Videos"
          description="Level up your game dev skills with our in-depth tutorial videos. Each month, we focus on techniques relevant to the theme. Learn how to create a parallax cherry blossom background, implement soft particle systems, or design intuitive UI inspired by Japanese aesthetics."
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Tutorial Video Thumbnail"
          reverse={true}
        >
          <YouTubeEmbed videoId="dQw4w9WgXcQ" />
        </DetailSection>

        <DetailSection
          title="Exclusive Monthly Game"
          description="Get inspired by playing and deconstructing our monthly themed game. This January, enjoy 'Sakura Spirit', a serene puzzle game that showcases the art, music, and code techniques covered in this month's resources. Dive deep into its mechanics and learn how it was built!"
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Sakura Spirit Game Screenshot"
        >
          <YouTubeEmbed videoId="dQw4w9WgXcQ" />
        </DetailSection>

        <DetailSection
          title="Vibrant Community & Events"
          description="Join our thriving community of game developers. Participate in monthly game jams, attend exclusive webinars with industry professionals, and connect with fellow creators in our members-only Discord server. Share your projects, get feedback, and collaborate on exciting new ideas!"
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Community Event Collage"
          reverse={true}
        />

        <DetailSection
          title="Premium Newsletter"
          description="Stay ahead of the game dev curve with our curated monthly newsletter. Get insights on industry trends, job opportunities, and spotlight features on successful indie developers. We'll also give you a sneak peek into next month's theme and resources, so you can start planning your projects early!"
          imageSrc="/placeholder.svg?height=400&width=600"
          imageAlt="Newsletter Preview"
        />

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Level Up Your Game Dev Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/login?redirect=/pricing">
                  Sign In to Subscribe
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

export default MembershipPage;
