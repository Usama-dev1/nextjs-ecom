"use server";
import prisma from "@/lib/prisma";
import { getMyCart } from "./cart.action";
import { getSessionAction } from "./auth.action";
import { redirect } from "next/navigation";
export async function createOrder(paymentMethod: string) {
  let orderId!: string;
  try {
    // check if user is logged in — no session means no order
    const session = await getSessionAction();
    if (!session?.success) return { success: false, message: "Not logged in" };
    const userId = session.user.id;

    // get user's current cart — if empty nothing to order
    const cart = await getMyCart();
    if (!cart || cart.items.length === 0)
      return { success: false, message: "Cart is empty" };

    // get shipping address from user — required before placing order
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { shippingAddress: true },
    });
    // if user skipped shipping address page send them back
    if (!user?.shippingAddress)
      return {
        success: false,
        message: "No shipping address found. Please add one first.",
      };

    // wrap everything in a transaction so if any step fails
    // nothing is saved — order, items, stock, cart all roll back together
    await prisma.$transaction(async (tx) => {
      // create the order record with prices snapshot from cart
      // prices are copied so future price changes dont affect this order
      const order = await tx.order.create({
        data: {
          userId,
          shippingAddress: user.shippingAddress ?? {},
          paymentMethod,
          itemsPrice: cart.itemsPrice,
          taxPrice: cart.taxPrice,
          shippingPrice: cart.shippingPrice,
          totalPrice: cart.totalPrice,
        },
      });

      // loop each cart item — create a permanent order item record
      // and reduce the product stock by how many were ordered
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            image: item.image,
            price: item.price, // snapshot price at time of order
            qty: item.qty,
          },
        });
        // decrement stock so overselling is prevented
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // delete all items from cart — order has been placed
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // reset cart totals to 0 — cart is now empty
      await tx.cart.update({
        where: { id: cart.id },
        data: { itemsPrice: 0, taxPrice: 0, shippingPrice: 0, totalPrice: 0 },
      });

      // save selected payment method to user
      // so it pre-fills next time they checkout
      await tx.user.update({
        where: { id: userId },
        data: { paymentMethod },
      });

      orderId = order.id;
    });

    // redirect is outside try/catch because Next.js redirect()
    // works by throwing an error internally — if inside catch
    // it would be caught and swallowed
  } catch (error) {
    console.error("[createOrder]:", error);
    return {
      success: false,
      message: error.message ?? "Failed to create order",
    };
  }

  // all steps succeeded — send user to their order page
  redirect(`/orders/${orderId}`);
}

export async function updateOrderPaymentMethod(
  orderId: string,
  method: string,
) {
  try {
    const session = await getSessionAction();
    if (!session?.success) return { success: false, message: "Not logged in" };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order not found" };
    if (order.userId !== session.user.id)
      return { success: false, message: "Unauthorized" };
    if (order.isPaid)
      return { success: false, message: "Cannot edit paid order" };

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: method },
    });

    // save as user default too
    await prisma.user.update({
      where: { id: session.user.id },
      data: { paymentMethod: method },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update payment method" };
  }
}