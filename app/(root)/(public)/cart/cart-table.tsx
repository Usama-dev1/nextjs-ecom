"use client";
import Image from "next/image";
import Link from "next/link";
import toastbar from "@/components/toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addItemToCart, deleteCartItem } from "@/lib/actions/cart.action";
import {
  Loader,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  Trash2Icon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/useSession";

type Cart = {
  id: string;
  items: {
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    qty: number;
    stock: number;
  }[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
};

const CartTable = ({ cart }: { cart: Cart }) => {
  const { items } = cart;
  const [isPending, setIsPending] = useState(false);
  const { refreshCart } = useSession();
  const router = useRouter();
  const handleAdd = async (item: Cart["items"][number]) => {
    setIsPending(true);
    try {
      const res = await addItemToCart({
        id: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        slug: item.slug,
      });
      if (res?.success) {
        await refreshCart();
        router.refresh(); // ← refresh server cart data
      }
      toastbar({
        success: res?.success,
        message: `${item.name} quantity increased`,
        link: false,
      });
    } finally {
      setIsPending(false);
    }
  };
  const handleDeleteItem = async (item: Cart["items"][number]) => {
    setIsPending(true);
    try {
      const res = await deleteCartItem(item.productId, true);
      if (res?.success) {
        await refreshCart();
        router.refresh(); // ← refresh server cart data
      }
      toastbar({
        success: res?.success,
        message: `${item.name} deleted from cart`,
        link: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async (item: Cart["items"][number]) => {
    setIsPending(true);
    try {
      const res = await deleteCartItem(item.productId);
      if (res?.success) {
        await refreshCart();
        router.refresh(); // ← refresh server cart data
      }
      toastbar({
        success: res?.success,
        message: `${item.name} quantity decreased`,
        link: false,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {!cart || items.length === 0 ? (
        <div className="flex items-center flex-col gap-4">
          <h1 className="py-4 h2-bold">Shopping Cart</h1>
          Cart is empty
          <Button variant="default" className="w-60" asChild>
            <Link href="/">Go to Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-2 grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto hidden md:flex md:col-span-3">
            <Table className="text-right">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left ">Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell className="text-center">
                      <div className="flex item-center">
                        <div className="mt-3 me-10">
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteItem(item)}>
                            <Trash2Icon className="text-red-500" />
                          </Button>
                        </div>
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            className="flex items-center text-center gap-2">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            />
                            <span>{item.name}</span>
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center text-right justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleRemove(item)}>
                          {isPending ? (
                            <Loader className="animate-spin w-4 h-4" />
                          ) : (
                            <MinusIcon className="w-4 h-4" />
                          )}
                        </Button>

                        <span className="w-6 text-center">{item.qty}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isPending || item.qty >= item.stock}
                          onClick={() => handleAdd(item)}>
                          {isPending ? (
                            <Loader className="animate-spin w-4 h-4" />
                          ) : (
                            <PlusIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell>${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile menu for cart*/}
          <div className="overflow-x-auto md:hidden">
            <Table>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    {/* image + name + price */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/product/${item.slug}`}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                        </Link>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-tight line-clamp-2">
                            {item.name.split(" ").length > 4
                              ? item.name.split(" ").slice(0, 3).join(" ") +
                                "..."
                              : item.name}
                          </span>
                          <span className="text-xs text-start text-muted-foreground">
                            ${item.price}
                          </span>

                          {/* qty controls inline under price */}
                        </div>
                      </div>
                    </TableCell>

                    {/* delete only */}
                    <TableCell className="py-2 w-10 text-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteItem(item)}>
                        <Trash2Icon className="text-red-500 w-3 h-3" />
                      </Button>
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          disabled={isPending}
                          onClick={() => handleRemove(item)}>
                          {isPending ? (
                            <Loader className="animate-spin w-3 h-3" />
                          ) : (
                            <MinusIcon className="w-3 h-3" />
                          )}
                        </Button>

                        <span className="text-xs w-4 text-center">
                          {item.qty}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          disabled={isPending || item.qty >= item.stock}
                          onClick={() => handleAdd(item)}>
                          {isPending ? (
                            <Loader className="animate-spin w-3 h-3" />
                          ) : (
                            <PlusIcon className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <Card className="mx-2">
              <CardContent className="flex flex-col items-center justify-center p-2 ">
                <div className="pb-3 text-xl">
                  Subtotal ({items.reduce((acc, c) => acc + c.qty, 0)}):{" "}
                  {formatCurrency(cart.itemsPrice)}
                </div>

                <div className="w-full ">
                  <Button
                    variant="default"
                    className="w-full "
                    onClick={() => router.push("/shipping-address")}>
                    <ArrowRightIcon />
                    Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
