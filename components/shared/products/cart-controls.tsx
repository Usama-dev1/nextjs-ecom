"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toastbar from "@/components/toast";
import { addItemToCart, deleteCartItem } from "@/lib/actions/cart.action";
import { Loader, MinusIcon, PlusIcon } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";

const CartControls = ({ product, cartItem }) => {
  const { refreshCart } = useSession();

  const [qty, setQty] = useState(cartItem?.qty ?? 0);
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
   
    setQty(cartItem?.qty ?? 0);
  }, [cartItem, product.id]);
  const handleAdd = async () => {
    setQty((prev) => prev + 1);
    setIsPending(true);
    try {
      const res = await addItemToCart(product);
      if (!res?.success) {
        setQty((prev) => prev - 1);
        toastbar({ success: false, message: res?.message ?? "" });
      } else {
         await refreshCart();
        toastbar({ success: true, message: `${product.name} added to cart` });
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setQty((prev) => prev - 1);
    setIsPending(true);
    try {
      const res = await deleteCartItem(product.id);
      if (!res?.success) {
        setQty((prev) => prev + 1);
        toastbar({ success: false, message: res?.message ?? "" });
      } else {
         await refreshCart();
        toastbar({
          success: true,
          message: `${product.name} removed from cart`,
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteAll = async () => {
    setQty(0);
    setIsPending(true);
    try {
      const res = await deleteCartItem(product.id, true);
      if (!res?.success) {
        setQty(cartItem?.qty ?? 1);
        toastbar({ success: false, message: res?.message ?? "" });
      } else {
         await refreshCart();
        toastbar({
          success: true,
          message: `${product.name} removed from cart`,
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col w-full md:px-10">
      {qty > 0 ? (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-evenly">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleDelete}
              disabled={isPending}>
              {isPending ? (
                <Loader size={40} className="animate-spin !h8 !w8" />
              ) : (
                <MinusIcon size={40} className="!w-5 !h-5" />
              )}
            </Button>
            <span className="w-8 text-center">{qty}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleAdd}
              disabled={qty >= product.stock}>
              {isPending ? (
                <Loader size={40} className="animate-spin" />
              ) : (
                <PlusIcon size={40} className="!w-5 !h-5" />
              )}
            </Button>
          </div>
          <Button
            variant="default"
            className="w-full mt-5 hover:bg-red-500"
            onClick={handleDeleteAll}
            disabled={isPending}>
            <MinusIcon size={40} className="!w-5 !h-5" />
            Remove from Cart
          </Button>
        </div>
      ) : !isPending ? (
        <Button variant="default" className="flex-1" onClick={handleAdd}>
          <PlusIcon size={40} className="!w-5 !h-5" />
          Add to Cart
        </Button>
      ) : (
        <div className="flex justify-center ">
          <Loader className="flex justify-center animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CartControls;
