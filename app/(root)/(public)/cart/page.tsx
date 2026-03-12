import { getMyCart } from "@/lib/actions/cart.action";
import CartTable from "./cart-table";
export const metadata = {
  title: "Shopping Cart",
};
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

const CartPage = async () => {
  const cart = await getMyCart();
  if (!cart)
    return (
      <CartTable
        cart={{
          id: "",
          items: [],
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
        }}
      />
    );

  return (
    <>
      <CartTable cart={cart} />
    </>
  );
};
export default CartPage;
