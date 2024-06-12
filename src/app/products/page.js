"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import MobxStore from "@/mobx";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { TitleDescription } from "@/reusable-ui/TitleDescription";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }) => {
  const router = useRouter();
  return (
    <Card className="p-4 flex flex-col gap-4 w-[300px]">
      <CardTitle>{product.name}</CardTitle>
      <CardDescription>{product.description}</CardDescription>
      <div className="bont-bold text-lg">${product.price}</div>
      <Image src={product.image} alt={product.name} width={200} height={200} />
      <Button onClick={() => router.push(`/?productId=${product.id}`)}>
        Find Contests <ChevronRight />
      </Button>
    </Card>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="sm:p-8 p-4">
      <TitleDescription title="Products" description="List of products" />
      {/* <Button onClick={() => MobxStore.seedFirestore()}>Seed</Button> */}
      <div className="flex flex-wrap gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
