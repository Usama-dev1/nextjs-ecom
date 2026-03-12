import { Metadata } from "next";
import ProductList from "@/components/shared/products/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  const products = await getLatestProducts();
  if (!products || products.length === 0) return <div>no products found </div>;
  return (
    <div className="m-4 md:m-0">
      {<ProductList data={products} title="New arrival" limit={6} />}
    </div>
  );
}
