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

    return products;
  } catch (error: any) {
    throw new Error("Failed to fetch products: " + error.message);
  }
};

export const getProductById = async (slug: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
    });
    return product;
  } catch (error: any) {
    throw new Error("Failed to fetch product: " + error.message);
  }
};
