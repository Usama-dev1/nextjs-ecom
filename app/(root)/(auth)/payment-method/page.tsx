import PaymentMethod from "./components/payment-method";
import CheckOutSteps from "@/components/checkout-steps"
const page = async({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex flex-col justify-center items-center">
      <CheckOutSteps current={1} />
      <PaymentMethod redirectTo={redirectTo} />
    </div>
  );
};
export default page;
