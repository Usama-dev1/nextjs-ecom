export const dynamic = "force-dynamic";
import ProductPrice from "@/components/shared/products/product-price";
import { Card, CardContent } from "@/components/ui/card";
import { getProductById } from "@/lib/actions/product.actions";
import { getCartItem } from "@/lib/actions/cart.action";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import CartControls from "@/components/shared/products/cart-controls";
import ProductImages from "@/components/shared/products/product-images";

type PageProps = { params: { slug: string } };

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) return notFound();
  // fetch cart and find matching item
  const cartItem = await getCartItem(product.id);

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 items-start">
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>
          <div className="col-span-2 p-5">
            <div className="flex flex-col mx-2">
              <p>
                {product.brand}
                {product.category}
              </p>
              <h1 className="h3-bold">{product.name}</h1>
              <p>
                {product.rating.toString()} of {product.numReviews} Reviews
              </p>
              <div className="flex flex-col text-center sm:flex-row sm:items-center">
                <ProductPrice
                  price={Number(product.price)}
                  className="w-25 text-xl rounded-full bg-green-100 text-green-700 px-4 py-3"
                />
              </div>
              <div className="mt-8">
                <p className="font-semibold">Description :</p>
                <p className="mt-2">{product.description}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Card className="mt-4 w-80 sm:mx-0">
              <CardContent className="p-6">
                <div className="mb-4 flex flex-row space-y-2 justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice price={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-5 flex-between justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge
                      variant="outline "
                      className="bg-green-200 animate-pulse">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="w-full justify-center">
                    <CartControls
                      product={{
                        name: product.name,
                        id: product.id,
                        price: Number(product.price),
                        image: product.images[0],
                        qty: 1,
                        slug:product.slug,
                        stock: product.stock,
                      }}
                      cartItem={cartItem ?? null}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
