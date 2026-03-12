"use client";
import { Button } from "@/components/ui/button";
import { RadioGroupChoiceCard } from "./radio-group";
import {
  createOrder,
  updateOrderPaymentMethod,
} from "@/lib/actions/order.actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PaymentMethod = ({ redirectTo }: { redirectTo?: string }) => {
  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState("COD");
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePlaceOrder = async () => {
    setIsPending(true);
    setError("");

    // if coming from order page → just update payment method, don't create new order
    if (redirectTo?.startsWith("/orders/")) {
      const orderId = redirectTo.split("/orders/")[1];
      const result = await updateOrderPaymentMethod(orderId, selected);
      if (result?.success) {
        router.push(redirectTo); // ← back to order page
      } else {
        setError(result?.message ?? "Failed to update");
      }
      setIsPending(false);
      return;
    }

    // normal checkout → create new order
    const result = await createOrder(selected);
    if (result?.success === false) {
      setError(result.message);
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div className="text-xl font-bold">Choose your Payment Method</div>

      <RadioGroupChoiceCard value={selected} onChange={setSelected} />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="mt-2">
        <Button
          variant="default"
          disabled={isPending} // ← add
          onClick={handlePlaceOrder} // ← add
        >
          {isPending ? "Placing Order..." : "Place your Order"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethod;
