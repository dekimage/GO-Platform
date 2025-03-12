"use client";

import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LoadingSpinner } from "@/reusable-ui/LoadingSpinner";

const GamesPage = observer(() => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/wordpress?category=game");

        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }

        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
        setError("Failed to load games. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-8">Games</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Games</h1>
      <p className="text-muted-foreground mb-8">
        Explore our collection of original games created by the Galactic
        Omnivore team and community.
      </p>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No games available at the moment.</p>
          <p className="text-muted-foreground">
            Check back soon for our upcoming game releases!
          </p>
        </div>
      )}
    </div>
  );
});

const GameCard = ({ game }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-5 flex-grow flex flex-col">
        <div className="flex gap-2 mb-3 flex-wrap">
          {game.categories
            .filter((cat) => cat.toLowerCase() !== "game")
            .map((category) => (
              <span
                key={category}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
        </div>

        <h2 className="text-xl font-bold mb-3">{game.title}</h2>

        <div
          className="text-muted-foreground text-sm mb-4 flex-grow"
          dangerouslySetInnerHTML={{ __html: game.excerpt }}
        />

        <Link href={`/blog/${game.slug}`} className="mt-auto">
          <Button variant="outline" className="w-full">
            Learn More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default GamesPage;
