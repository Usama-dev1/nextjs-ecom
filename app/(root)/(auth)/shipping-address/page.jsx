import { ShippingForm } from "./components/shipping-form";
import { getSessionAction } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import CheckOutSteps from "@/components/checkout-steps";
import prisma from "@/lib/prisma";
const page = async ({ searchParams }) => {
  const { redirect: redirectTo } = await searchParams;
  const session = await getSessionAction();
  if (!session?.success) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { shippingAddress: true },
  });

  const orderId = redirectTo?.startsWith("/orders/")
    ? redirectTo.split("/orders/")[1]
    : undefined;

  return (
    <div className="w-full px-6 md:px-10">
      <CheckOutSteps current={0} />
      <ShippingForm
        savedAddress={user?.shippingAddress ?? null}
        redirectTo={redirectTo ?? "/payment-method"}
        orderId={orderId}
      />
    </div>
  );
};
export default page;
