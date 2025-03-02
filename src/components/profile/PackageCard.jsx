import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LockIcon, UnlockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PackageCard({ package: pkg, isUnlocked }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={isUnlocked ? "success" : "secondary"}>
            {isUnlocked ? "Owned" : "Locked"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-bold mb-1">{pkg.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {pkg.month} {pkg.year}
        </p>
        <p className="text-sm line-clamp-2">{pkg.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isUnlocked ? (
          <Button asChild className="w-full">
            <Link href={`/packages/${pkg.slug}`}>
              <UnlockIcon className="h-4 w-4 mr-2" />
              Open Package
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            <LockIcon className="h-4 w-4 mr-2" />
            Subscribe to Unlock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
