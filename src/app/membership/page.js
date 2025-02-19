"use client"

import { useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const MembershipPlan = () => (
    <Card className="w-full max-w-md mx-auto bg-card text-card-foreground">
        <CardHeader>
            <CardTitle className="text-3xl font-bold">Member Plan</CardTitle>
            <CardDescription className="text-xl">500 Den. /mo</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {[
                    "Theme of the Month Art packages",
                    "Music packs",
                    "Code packs (bundle assets)",
                    "Instructional tutorial videos (game dev)",
                    "Free game (thematic for the month)",
                    "Community events",
                    "Member only Discord access",
                    "Premium newsletter",
                ].map((benefit, index) => (
                    <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>
            <Link href="/become-member">
                <Button className="w-full mt-6">Join Now</Button>
            </Link>
        </CardContent>
    </Card>
)

const DetailSection = ({ title, description, imageSrc, imageAlt, reverse = false }) => (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 py-16`}>
        <div className="w-full md:w-1/2">
            <Image src={imageSrc || "/placeholder.svg"} alt={imageAlt} width={600} height={400} className="rounded-lg" />
        </div>
        <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-lg">{description}</p>
        </div>
    </div>
)

const AudioPreview = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false)

    const togglePlay = () => {
        const audio = document.getElementById("audio-preview")
        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }

    return (
        <div className="flex items-center space-x-4">
            <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
            <span>5-second preview</span>
            <audio id="audio-preview" src={src} />
        </div>
    )
}

const YouTubeEmbed = ({ videoId }) => (
    <div className="aspect-w-16 aspect-h-9">
        <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
        />
    </div>
)

export default function MembershipPage() {
    return (
        <div className=" bg-background text-foreground">
            <Head>
                <title>Membership - Your Game Dev Community</title>
                <meta
                    name="description"
                    content="Join our exclusive game development community and get access to monthly themed assets, tutorials, and more!"
                />
            </Head>

            <main className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-center mb-16">Exclusive Membership</h1>

                <MembershipPlan />

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
                    <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Game Dev Journey?</h2>
                    <Button size="lg">Join Our Community Today</Button>
                </div>
            </main>
        </div>
    )
}

