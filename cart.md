# 🛒 Cart Implementation Guide

> Guest + authenticated cart with state management, merge on login, and price calculation.

---

## Folder Structure

```
src/
├── lib/
│   ├── cart/
│   │   └── cart.ts                  ← all server cart logic
│   ├── actions/
│   │   └── cart.action.ts           ← thin server actions
│   └── store/
│       ├── reducers/
│       │   └── cartReducer.ts       ← cart state + reducer
│       ├── actions.ts               ← action constants
│       └── CartProvider.tsx         ← client state provider + useCart hook
│
├── components/
│   └── features/
│       └── cart/
│           ├── AddToCartButton.tsx  ← product page button
│           ├── CartCount.tsx        ← navbar badge
│           ├── CartItemRow.tsx      ← single item row
│           ├── CartSummary.tsx      ← price breakdown
│           └── CartPageClient.tsx   ← cart page client wrapper
│
└── app/
    └── (shop)/
        └── cart/
            └── page.tsx             ← cart page (server component)
```

---

## Build Order

> Always build in this order — each file depends on the one before it.

| # | File | Depends On |
|---|------|------------|
| 1 | `cartReducer.ts` | nothing |
| 2 | `actions.ts` | nothing |
| 3 | `cart.ts` | prisma |
| 4 | `cart.action.ts` | `cart.ts` + session |
| 5 | `CartProvider.tsx` | `cartReducer.ts` + `cart.action.ts` |
| 6 | `layout.tsx` | `CartProvider.tsx` |
| 7 | `AddToCartButton.tsx` | `CartProvider.tsx` |
| 8 | `CartCount.tsx` | `CartProvider.tsx` |
| 9 | `CartItemRow.tsx` | `CartProvider.tsx` |
| 10 | `CartSummary.tsx` | `CartProvider.tsx` |
| 11 | `CartPageClient.tsx` + `cart/page.tsx` | all above |
| 12 | login form | `CartProvider.tsx` |
| 13 | logout handler | `CartProvider.tsx` |

---

## How it Works

```
Guest visits site
  → adds item → cartSessionId cookie created → cart saved in db

Guest logs in
  → mergeCart runs on server → guest cart merged into user cart
  → client calls fetchCart → state updates with merged cart

User logs out
  → CLEAR_CART dispatched → state emptied
  → next add to cart creates fresh guest cart
```

### Price Calculation

| Field | Formula |
|-------|---------|
| `itemsPrice` | sum of `(price × qty)` for all items |
| `taxPrice` | `itemsPrice × 0.15` |
| `shippingPrice` | `$0` if itemsPrice > $100, else `$10` |
| `totalPrice` | `itemsPrice + taxPrice + shippingPrice` |

---

## FILE 1 — Cart Reducer

**What it does:** Defines what cart state looks like and how it changes. Pure logic — no db, no network calls.

**Create:** `src/lib/store/reducers/cartReducer.ts`

```ts
export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
};

export type CartState = {
  id: string | null;
  items: CartItem[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  loading: boolean;
  error: string;
};

export const cartInitialState: CartState = {
  id: null,
  items: [],
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
  loading: false,
  error: "",
};

export const cartReducer = (state: CartState, action: any): CartState => {
  switch (action.type) {
    case "CART_LOADING":
      return { ...state, loading: true, error: "" };
    case "SET_CART":
      return {
        id: action.payload.id,
        items: action.payload.items,
        itemsPrice: Number(action.payload.itemsPrice),
        taxPrice: Number(action.payload.taxPrice),
        shippingPrice: Number(action.payload.shippingPrice),
        totalPrice: Number(action.payload.totalPrice),
        loading: false,
        error: "",
      };
    case "CLEAR_CART":
      return cartInitialState;
    case "CART_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
```

**Test:** No test yet — this is just logic. Move on.

---

## FILE 2 — Action Constants

**What it does:** One place for all action type strings. Prevents typos. TypeScript will catch wrong names.

**Create:** `src/lib/store/actions.ts`

```ts
export const CART_ACTIONS = {
  CART_LOADING: "CART_LOADING",
  SET_CART: "SET_CART",
  CLEAR_CART: "CLEAR_CART",
  CART_ERROR: "CART_ERROR",
} as const;
```

**Test:** No test yet. Move on.

---

## FILE 3 — Cart Server Logic

**What it does:** All the heavy lifting. Talks to the database. Never called directly from the client — only through actions.

**Functions in this file:**
- `getCartSessionId` — reads cookie, returns id, does NOT set cookie
- `setCartSessionCookie` — sets the cookie, only called during mutations
- `getCart` — finds cart, returns it or null
- `getOrCreateCart` — finds or creates cart
- `addToCart` — adds item or increments qty, recalculates prices
- `removeFromCart` — deletes item, recalculates prices
- `updateCartItemQty` — updates qty or deletes if 0, recalculates prices
- `recalculateCart` — recalculates all prices, saves to db, returns updated cart
- `mergeCart` — merges guest cart into user cart on login

**Create:** `src/lib/cart/cart.ts`

```ts
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

// read cartSessionId cookie — does NOT set it
export const getCartSessionId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("cartSessionId")?.value ?? null;
};

// set cartSessionId cookie — only called during mutations
export const setCartSessionCookie = async (sessionId: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "cartSessionId",
    value: sessionId,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
};

// get cart — returns null if not found
export const getCart = async (userId?: string) => {
  const cartSessionId = await getCartSessionId();

  if (userId) {
    return prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
  }

  if (!cartSessionId) return null;

  return prisma.cart.findFirst({
    where: { sessionId: cartSessionId, userId: null },
    include: { items: true },
  });
};

// get or create cart — always returns a cart
export const getOrCreateCart = async (userId?: string) => {
  const existingCart = await getCart(userId);
  if (existingCart) return existingCart;

  let cartSessionId = await getCartSessionId();
  if (!cartSessionId) {
    cartSessionId = uuid();
    await setCartSessionCookie(cartSessionId);
  }

  return prisma.cart.create({
    data: {
      sessionId: cartSessionId,
      userId: userId ?? null,
    },
    include: { items: true },
  });
};

// add item to cart or increment qty if already exists
export const addToCart = async (
  productId: string,
  name: string,
  image: string,
  price: number,
  userId?: string
) => {
  let cartSessionId = await getCartSessionId();
  if (!cartSessionId && !userId) {
    cartSessionId = uuid();
    await setCartSessionCookie(cartSessionId);
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((i) => i.productId === productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { qty: existingItem.qty + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, name, image, price, qty: 1 },
    });
  }

  return recalculateCart(cart.id);
};

// remove item from cart
export const removeFromCart = async (cartItemId: string, cartId: string) => {
  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return recalculateCart(cartId);
};

// update item qty — deletes item if qty reaches 0
export const updateCartItemQty = async (
  cartItemId: string,
  qty: number,
  cartId: string
) => {
  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { qty },
    });
  }
  return recalculateCart(cartId);
};

// recalculate all cart prices and save to db
export const recalculateCart = async (cartId: string) => {
  const items = await prisma.cartItem.findMany({ where: { cartId } });

  const itemsPrice = items.reduce(
    (acc, i) => acc + Number(i.price) * i.qty,
    0
  );
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number(
    (itemsPrice + taxPrice + shippingPrice).toFixed(2)
  );

  return prisma.cart.update({
    where: { id: cartId },
    data: { itemsPrice, taxPrice, shippingPrice, totalPrice },
    include: { items: true },
  });
};

// merge guest cart into user cart — called after login
export const mergeCart = async (userId: string) => {
  const cartSessionId = await getCartSessionId();
  if (!cartSessionId) return;

  const guestCart = await prisma.cart.findFirst({
    where: { sessionId: cartSessionId, userId: null },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });

  if (!userCart) {
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId },
    });
    return;
  }

  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(
      (i) => i.productId === guestItem.productId
    );

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + guestItem.qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          name: guestItem.name,
          image: guestItem.image,
          price: guestItem.price,
          qty: guestItem.qty,
        },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  await recalculateCart(userCart.id);
};
```

**Test:** No test yet — needs actions first. Move on.

---

## FILE 4 — Cart Actions

**What it does:** Thin server actions the client calls. Gets userId from session. Calls cart logic. Returns success/fail + updated cart.

**Create:** `src/lib/actions/cart.action.ts`

```ts
"use server";
import { getSession } from "@/lib/auth/session";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQty,
} from "@/lib/cart/cart";

const getUserId = async () => {
  const session = await getSession();
  return session?.success ? session.user.id : undefined;
};

export const getCartAction = async () => {
  try {
    const userId = await getUserId();
    return getCart(userId);
  } catch {
    return null;
  }
};

export const addToCartAction = async (product: {
  id: string;
  name: string;
  image: string;
  price: number;
}) => {
  try {
    const userId = await getUserId();
    const cart = await addToCart(
      product.id,
      product.name,
      product.image,
      product.price,
      userId
    );
    return { success: true, cart };
  } catch {
    return { success: false, message: "Failed to add to cart" };
  }
};

export const removeFromCartAction = async (
  cartItemId: string,
  cartId: string
) => {
  try {
    const cart = await removeFromCart(cartItemId, cartId);
    return { success: true, cart };
  } catch {
    return { success: false, message: "Failed to remove item" };
  }
};

export const updateCartItemQtyAction = async (
  cartItemId: string,
  qty: number,
  cartId: string
) => {
  try {
    const cart = await updateCartItemQty(cartItemId, qty, cartId);
    return { success: true, cart };
  } catch {
    return { success: false, message: "Failed to update quantity" };
  }
};
```

**Test:** No test yet — needs CartProvider first. Move on.

---

## FILE 5 — Cart Provider

**What it does:** Client side state manager. Wraps the app. Fetches cart on mount. Exposes state, dispatch, fetchCart to all components via `useCart` hook.

**Create:** `src/lib/store/CartProvider.tsx`

```tsx
"use client";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { cartReducer, cartInitialState, CartState } from "./reducers/cartReducer";
import { getCartAction } from "@/lib/actions/cart.action";
import { CART_ACTIONS } from "./actions";

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<any>;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  const fetchCart = useCallback(async () => {
    dispatch({ type: CART_ACTIONS.CART_LOADING });
    try {
      const cart = await getCartAction();
      if (cart) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: cart });
      }
    } catch {
      dispatch({ type: CART_ACTIONS.CART_ERROR, payload: "Failed to load cart" });
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
```

**Test:** No test yet — needs layout wrap first. Move on.

---

## FILE 6 — Wrap Layout

**What it does:** Makes cart state available to every component in the app.

**Update:** `src/app/layout.tsx`

```tsx
import { CartProvider } from "@/lib/store/CartProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

✅ **TEST CHECKPOINT 1**
- open browser console
- go to any page
- no errors should appear
- if you see "useCart must be used within CartProvider" — CartProvider is not wrapping your layout

---

## FILE 7 — AddToCartButton

**What it does:** Adds a product to cart. Dispatches loading while waiting. Updates state on success.

**Create:** `src/components/features/cart/AddToCartButton.tsx`

```tsx
"use client";
import { useCart } from "@/lib/store/CartProvider";
import { addToCartAction } from "@/lib/actions/cart.action";
import { CART_ACTIONS } from "@/lib/store/actions";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
};

export const AddToCartButton = ({ product }: { product: Product }) => {
  const { state, dispatch } = useCart();

  const handleAddToCart = async () => {
    dispatch({ type: CART_ACTIONS.CART_LOADING });
    const result = await addToCartAction(product);
    if (result.success) {
      dispatch({ type: CART_ACTIONS.SET_CART, payload: result.cart });
    } else {
      dispatch({ type: CART_ACTIONS.CART_ERROR, payload: result.message });
    }
  };

  return (
    <Button onClick={handleAddToCart} disabled={state.loading} className="w-full">
      {state.loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
};
```

**Add to your product page:**

```tsx
import { AddToCartButton } from "@/components/features/cart/AddToCartButton";

// pass product data to it
<AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    image: product.images[0],
    price: Number(product.price),
  }}
/>
```

✅ **TEST CHECKPOINT 2**
- go to a product page
- click "Add to Cart"
- button shows "Adding..." then goes back
- open Neon db — check `Cart` and `CartItem` tables
- a row should exist with your product
- if no row — check console for errors

---

## FILE 8 — CartCount

**What it does:** Navbar badge showing total items. Reads from state — no db call.

**Create:** `src/components/features/cart/CartCount.tsx`

```tsx
"use client";
import { useCart } from "@/lib/store/CartProvider";

export const CartCount = () => {
  const { state } = useCart();
  const count = state.items.reduce((acc, i) => acc + i.qty, 0);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
      {count}
    </span>
  );
};
```

**Add to your Navbar:**

```tsx
import { CartCount } from "@/components/features/cart/CartCount";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

<Link href="/cart" className="relative">
  <ShoppingCart className="w-6 h-6" />
  <CartCount />
</Link>
```

✅ **TEST CHECKPOINT 3**
- add a product to cart
- navbar badge should show the count
- add same product again — count should go up by 1
- add different product — count should go up by 1

---

## FILE 9 — CartItemRow

**What it does:** Renders a single cart item. Has plus, minus, and remove controls. Every action updates db and syncs state.

**Create:** `src/components/features/cart/CartItemRow.tsx`

```tsx
"use client";
import { useCart } from "@/lib/store/CartProvider";
import { removeFromCartAction, updateCartItemQtyAction } from "@/lib/actions/cart.action";
import { CART_ACTIONS } from "@/lib/store/actions";
import { CartItem } from "@/lib/store/reducers/cartReducer";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";

export const CartItemRow = ({ item }: { item: CartItem }) => {
  const { state, dispatch } = useCart();

  const handleRemove = async () => {
    dispatch({ type: CART_ACTIONS.CART_LOADING });
    const result = await removeFromCartAction(item.id, item.cartId);
    if (result.success) {
      dispatch({ type: CART_ACTIONS.SET_CART, payload: result.cart });
    } else {
      dispatch({ type: CART_ACTIONS.CART_ERROR, payload: result.message });
    }
  };

  const handleQtyChange = async (newQty: number) => {
    dispatch({ type: CART_ACTIONS.CART_LOADING });
    const result = await updateCartItemQtyAction(item.id, newQty, item.cartId);
    if (result.success) {
      dispatch({ type: CART_ACTIONS.SET_CART, payload: result.cart });
    } else {
      dispatch({ type: CART_ACTIONS.CART_ERROR, payload: result.message });
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-muted-foreground text-sm">
          ${Number(item.price).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQtyChange(item.qty - 1)}
          disabled={state.loading}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-medium">{item.qty}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQtyChange(item.qty + 1)}
          disabled={state.loading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <p className="w-20 text-right font-medium">
        ${(Number(item.price) * item.qty).toFixed(2)}
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={state.loading}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

---

## FILE 10 — CartSummary

**What it does:** Shows price breakdown. Reads from state — updates automatically when cart changes. Shows checkout or login button based on whether user is logged in.

**Create:** `src/components/features/cart/CartSummary.tsx`

```tsx
"use client";
import { useCart } from "@/lib/store/CartProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const CartSummary = ({ userId }: { userId?: string }) => {
  const { state } = useCart();

  return (
    <div className="border rounded-lg p-6 space-y-4 sticky top-4">
      <h2 className="font-semibold text-lg">Order Summary</h2>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${state.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (15%)</span>
          <span>${state.taxPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {state.shippingPrice === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              `$${state.shippingPrice.toFixed(2)}`
            )}
          </span>
        </div>
        {state.itemsPrice < 100 && state.itemsPrice > 0 && (
          <p className="text-xs text-muted-foreground">
            Add ${(100 - state.itemsPrice).toFixed(2)} more for free shipping
          </p>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>${state.totalPrice.toFixed(2)}</span>
      </div>
      {userId ? (
        <Button className="w-full" asChild>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      ) : (
        <Button className="w-full" asChild>
          <Link href="/login?redirect=/checkout">Login to Checkout</Link>
        </Button>
      )}
    </div>
  );
};
```

---

## FILE 11 — Cart Page

**What it does:** Server component that gets session. Passes userId down. CartPageClient reads from state and renders items + summary.

**Create:** `src/app/(shop)/cart/page.tsx`

```tsx
import { getSession } from "@/lib/auth/session";
import { CartPageClient } from "@/components/features/cart/CartPageClient";

export default async function CartPage() {
  const session = await getSession();
  const userId = session?.success ? session.user.id : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <CartPageClient userId={userId} />
    </div>
  );
}
```

**Create:** `src/components/features/cart/CartPageClient.tsx`

```tsx
"use client";
import { useCart } from "@/lib/store/CartProvider";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CartPageClient = ({ userId }: { userId?: string }) => {
  const { state } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Your cart is empty</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {state.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <div className="lg:col-span-1">
        <CartSummary userId={userId} />
      </div>
    </div>
  );
};
```

✅ **TEST CHECKPOINT 4**
- go to `/cart`
- items should show from previous test
- change qty with plus/minus — numbers update
- remove an item — it disappears
- CartSummary shows correct prices
- if not logged in — button says "Login to Checkout"
- if logged in — button says "Proceed to Checkout"

---

## FILE 12 — Auth Updates

**What it does:** Merges guest cart on login. Syncs merged cart to client state. Clears cart on logout.

### Login Action — add mergeCart

**Update:** `src/lib/actions/auth.action.ts`

```ts
import { mergeCart } from "@/lib/cart/cart"; // add this import

export const loginAction = async ({ email, password }) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) return { message: "Invalid credentials" };

    const match = await verifyPassword(password, user.password);
    if (!match) return { message: "Invalid credentials" };

    await createSession(user.id);
    await mergeCart(user.id); // merge guest cart — must finish before returning

    return { data: { name: user.name, email: user.email }, message: "Logged in successfully" };
  } catch {
    return { message: "Something went wrong. Please try again." };
  }
};
```

### Login Form — fetchCart after login

**Update your login form component:**

```tsx
const { fetchCart } = useCart();

const handleLogin = async () => {
  const result = await loginAction({ email, password });
  if (result.data) {
    await fetchCart(); // get merged cart into state
    router.push(redirectUrl || "/");
  }
};
```

### Logout Handler — clear cart

**Update your logout handler:**

```tsx
const { dispatch } = useCart();

const handleLogout = async () => {
  const result = await logoutAction();
  if (result.success) {
    dispatch({ type: CART_ACTIONS.CLEAR_CART }); // empty cart immediately
    router.push("/");
  }
};
```

✅ **TEST CHECKPOINT 5 — Full Flow**
- as guest add 2 products to cart
- log in
- cart should still show those 2 products (merged)
- log out
- cart count in navbar should be 0
- add items as guest again — fresh cart created

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `useCart must be used within CartProvider` | CartProvider not in layout | Wrap layout with CartProvider |
| Cart not showing on page load | `getCartAction` returning null | Check cartSessionId cookie exists in browser |
| Prices not updating | `recalculateCart` not being called | Make sure addToCart returns recalculateCart result |
| Guest cart not merging | `mergeCart` not being called | Add mergeCart to loginAction |
| Loading stuck | Action failed but no CART_ERROR dispatch | Add else branch with CART_ERROR dispatch |