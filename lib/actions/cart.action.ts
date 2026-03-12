"use server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

///Grab Item Quantatiy for Cart////////////////////////////
export const cartItemQty = async () => {
  try {
    const cart = await getMyCart();
    let cartQty = null;
    if (cart === null) return cartQty;
    if (cart) {
      cartQty = cart.items.reduce((acc, c) => acc + c.qty, 0);
    }
    return Number(cartQty);
  } catch (error) {
    console.error(error);
    return 0; 
  }
};
///////////////////////////////////////////////////////////


/////grab cart session from cart session cookie/////////////
export const cartSession = async () => {
  try {
    const cookiesStore = await cookies();
    const existingCartId = cookiesStore.get("CartSessionId")?.value ?? null;
    const existingSessionId = cookiesStore.get("SessionId")?.value ?? null;

    // Safety net — should never happen after initCartSession in layout
    if (!existingCartId) {
      return { success: false, message: "Cart session cookie missing" };
    }

    let userId = null;
    if (existingSessionId) {
      const session = await prisma.session.findUnique({
        where: { id: existingSessionId },
        select: { userId: true },
      });
      userId = session?.userId ?? null;
    }

    return { success: true, cartSessionId: existingCartId, userId };
  } catch (error) {
    console.error("[cartSession]: Failed", error);
    return { success: false, message: "Cart session error" };
  }
};
////////////////////////////////////////////////////////////



////update cart when product adds removes or qty update/////
export const reCalCartPrices = async (cartId) => {
  const allCartItems = await prisma.cartItem.findMany({
    where: { cartId },
  });
  const itemsPrice = Number(
    allCartItems
      .reduce((sum, { price, qty }) => sum + Number(price) * Number(qty), 0)
      .toFixed(2),
  );
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  //if product then generate shipping otherwise 0
  const shippingPrice = itemsPrice > 0 && itemsPrice < 100 ? 10 : 0;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // update cart with new prices
  // prisma.cart.update({ where: { id: cart.id }, data: { itemsPrice, taxPrice, shippingPrice, totalPrice } })
  const updatedCart = await prisma.cart.update({
    where: { id: cartId },
    data: {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    },
  });
  if (updatedCart) return { success: true, message: "cart prices updated" };
  else return { success: false, message: `failed to update cart` };
};
///////////////////////////////////////////////////////////




///////add items to cart and send cart cookie///////////////
export async function addItemToCart(data) {
  try {
    const session = await cartSession();
    if (!session.success) return { success: false, message: "Session error" };
    const { cartSessionId, userId } = session;
    //check if this cart session already has a cart
    const cart = await getOrCreateCart(cartSessionId, userId);
    if (!cart) throw new Error("Could not create cart");
    const product = await prisma.product.findUnique({
      where: { id: data.id },
    });
    if (!product) throw new Error("Product not found");

    // check if item already exists in cart
    // prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: data.id } } })
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: data.id } },
    });
    // if exists, increase qty by 1
    // prisma.cartItem.update({ where: { id: existingItem.id }, data: { qty: existingItem.qty + 1 } })
    if (existingItem) {
      if (existingItem.qty >= product.stock)
        throw new Error("Not enough stock");
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + 1 },
      });
    }
    // if not, create new cart item
    // prisma.cartItem.create({ data: { cartId, productId, name, image, price, qty: 1 } })
    else {
      if (product.stock < 1) throw new Error("Not enough stock");

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          name: product.name,
          image: data.image,
          price: product.price,
          slug: product.slug,
          qty: 1,
          stock: product.stock,
        },
      });
    }

    //recalucalte other prices of tax shipping etc
    const updateCart = await reCalCartPrices(cart.id);
    if (!updateCart.success) throw new Error("unable to update cart");
    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: "cart created successfully",
    };
  } catch (error) {
    console.error("[addItemToCart]:Something is wrong", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}
////////////////////////////////////////////////////////////





/////reduce single item from cart per quantity or delete it///
export async function deleteCartItem(
  productId: string,
  deleteAll: boolean = false,
) {
  try {
    const session = await cartSession();
    if (!session.success) return { success: false, message: "Session error" };
    const { cartSessionId, userId } = session;

    const cart = await getOrCreateCart(cartSessionId, userId);
    if (!cart) throw new Error("Cart not found");
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!existingItem) throw new Error("Item not found");

    if (deleteAll || existingItem.qty === 1) {
      await prisma.cartItem.delete({
        where: { id: existingItem.id },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty - 1 },
      });
    }
    const updateCart = await reCalCartPrices(cart.id);
    if (!updateCart.success) throw new Error("unable to update cart");

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    revalidatePath(`/product/${product?.slug}`);

    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("[deleteCartItem]:", error);
    return { success: false, message: "Failed to remove item" };
  }
}
//////////////////////////////////////////////////////////////


////////get the current cart//////////////////////////////////
export async function getMyCart() {
  try {
    const session = await cartSession();
    if (!session.success) return null;
    const { cartSessionId, userId } = session;

    const cart = await getOrCreateCart(cartSessionId, userId);
    if (!cart) return null;

    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
    if (!fullCart) return null;

    return {
      ...fullCart,
      itemsPrice: Number(fullCart.itemsPrice),
      taxPrice: Number(fullCart.taxPrice),
      shippingPrice: Number(fullCart.shippingPrice),
      totalPrice: Number(fullCart.totalPrice),
      items: fullCart.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  } catch (error) {
    console.error("[getMyCart]:", error);
    return null;
  }
}
/////////////////////////////////////////////////////////////


////get the items in cart////////////////////////////////////
export async function getCartItem(productId) {
  const cart = await getMyCart();
  const cartItem = cart?.items?.find((item) => item.productId === productId);
  return cartItem;
}
////////////////////////////////////////////////////////////


/////////////merge guest cart with user cart/////////////////
const mergeCartsIntoUserCart = async (
  guestCartId: string,
  userCartId: string,
) => {
  //check guest items from cart id
  const guestItems = await prisma.cartItem.findMany({
    where: { cartId: guestCartId },
  });

  //now loop guest item array for each exisiting
  // item up the quantity in user cart and create for no items
  for (const guestItem of guestItems) {
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: userCartId,
          productId: guestItem.productId,
        },
      },
    });
    //merge guest cart item to old user cart
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + guestItem.qty },
      });
    } else {
      //if not create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: userCartId,
          productId: guestItem.productId,
          name: guestItem.name,
          image: guestItem.image,
          price: guestItem.price,
          qty: guestItem.qty,
          slug: guestItem.slug,
          stock: guestItem.stock, 
        },
      });
    }
  }
  //then delete the guest cart
  await prisma.cart.delete({ where: { id: guestCartId } });
 
  //then cal shipping tax and total prices
  await reCalCartPrices(userCartId);
};
/////////////////////////////////////////////////////////////

/////if theres a cart get that or create new cart/////////////
const getOrCreateCart = async (
  cartSessionId: string,
  userId: string | null,
) => {
  //check from session cart if guest has a cart
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: cartSessionId },
  });
  //if user id is passed find the cart of user
  if (userId) {
    const userCart = await prisma.cart.findFirst({ where: { userId } });

    // Both exist — merge guest into user cart
    if (userCart && guestCart && userCart.id !== guestCart.id) {
      await mergeCartsIntoUserCart(guestCart.id, userCart.id);
      return userCart;
    }

    if (guestCart && !userCart) {
      // Claim the guest cart for this user
      return await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId },
      });
    }

    if (userCart) return userCart;
  }
 //if guest has cart return guest cart
  if (guestCart) return guestCart;

  //if No cart exists at all — create one
  try {
    return await prisma.cart.create({
      data: { sessionId: cartSessionId, userId },
    });
  } catch {
    // Race condition: another request created it first
    return await prisma.cart.findUnique({
      where: { sessionId: cartSessionId },
    });
  }
};
//////////////////////////////////////////////////////////////