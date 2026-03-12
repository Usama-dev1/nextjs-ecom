"use server";
import prisma from "@/lib/prisma";
export const getLatestProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    rating: Number(p.rating),
    description: p.description ?? "",
    banner: p.banner ?? "",
    images: p.images as string[],
  }));
  } catch (error) {
    throw new Error("Failed to fetch products: " + error);
  }
};

export const getProductById = async (slug: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
    });
    return product;
  } catch (error) {
    throw new Error("Failed to fetch product: " + error);
  }
};
