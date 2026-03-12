import PaymentMethod from "./components/payment-method";
import CheckOutSteps from "@/components/checkout-steps"
const page = async({ searchParams }) => {
    const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex flex-col justify-center items-center">
      <CheckOutSteps current={1} />
      <PaymentMethod redirectTo={redirectTo ?? null} />
    </div>
  );
};
export default page;
