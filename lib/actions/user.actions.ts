"use server";
import prisma from "@/lib/prisma";
import { cartSession } from "./cart.action";

export const shippingAddressAction = async (
  data: unknown,
  orderId?: string,
) => {
  try {
    const { success, userId } = await cartSession();

    if (!success || !userId) {
      return { success: false, message: "Please Login" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { shippingAddress: data },
    });

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { shippingAddress: data as object }, // data not address
      });
    }

    return { success: true, shippingAddress: user.shippingAddress };
  } catch (error) {
    console.error("[user.actions]:Shipping Address failed", error);
    return { success: false, message: "Failed to save address" };
  }
};
