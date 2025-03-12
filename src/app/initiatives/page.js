"use client";

import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LoadingSpinner } from "@/reusable-ui/LoadingSpinner";

const InitiativesPage = observer(() => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/wordpress?category=initiative");

        if (!response.ok) {
          throw new Error("Failed to fetch initiatives");
        }

        const data = await response.json();
        setInitiatives(data);
      } catch (error) {
        console.error("Error fetching initiatives:", error);
        setError("Failed to load initiatives. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-8">Initiatives</h1>
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
      <h1 className="text-4xl font-bold mb-4">Initiatives</h1>
      <p className="text-muted-foreground mb-8">
        Discover our community projects and initiatives aimed at supporting game
        developers and creators.
      </p>

      {initiatives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {initiatives.map((initiative) => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">
            No initiatives available at the moment.
          </p>
          <p className="text-muted-foreground">
            Check back soon for our upcoming community initiatives!
          </p>
        </div>
      )}
    </div>
  );
});

const InitiativeCard = ({ initiative }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative h-48 md:h-auto md:w-1/3 overflow-hidden">
          <Image
            src={initiative.thumbnail}
            alt={initiative.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-5 flex-grow md:w-2/3 flex flex-col">
          <div className="flex gap-2 mb-3 flex-wrap">
            {initiative.categories
              .filter((cat) => cat.toLowerCase() !== "initiative")
              .map((category) => (
                <span
                  key={category}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
          </div>

          <h2 className="text-xl font-bold mb-3">{initiative.title}</h2>

          <div
            className="text-muted-foreground text-sm mb-4 flex-grow"
            dangerouslySetInnerHTML={{ __html: initiative.excerpt }}
          />

          <Link href={`/blog/${initiative.slug}`} className="mt-auto">
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};

export default InitiativesPage;
