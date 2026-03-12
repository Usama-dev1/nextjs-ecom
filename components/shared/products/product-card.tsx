import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ProductPrice from "./product-price";
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="md:w-full max-w-xs">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            priority={true}
          />
        </Link>
      </CardHeader>
      <CardContent className="md:p-4 grid gap-4">
        <div className="text-xs">{product.brand}</div>
        <Link
          href={`product/${product.slug}`}
          className="text-sm font-medium text-wrap">
          {product.name}
        </Link>
        <div className="flex-between gap-4">
          <p>{product.rating.toString()} Stars</p>
          {product.stock>0 ? (
            <ProductPrice price={Number(product.price)}/>
          ) : (
            <p className="text-destructive">Out of Stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default ProductCard;
