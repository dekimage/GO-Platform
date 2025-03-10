import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

export default function PackageCard({ package: pkg }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-[300px]">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{pkg.title}</h3>
          <span className="text-muted-foreground">
            {pkg.month} {pkg.year}
          </span>
        </div>
        <p className="text-lg text-muted-foreground">{pkg.theme}</p>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{pkg.description}</p>

        <h4 className="font-semibold text-lg mb-2">Package Includes:</h4>
        <ul className="space-y-2">
          {pkg.assets.map((asset, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <div>
                <p className="font-medium">{asset.title}</p>
                <p className="text-sm text-muted-foreground">
                  {asset.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
