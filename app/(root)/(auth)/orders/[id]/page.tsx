// app/(root)/order/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getSessionAction } from "@/lib/actions/auth.action";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  Pencil,
} from "lucide-react";

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const session = await getSessionAction();
  if (!session?.success) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });

  if (!order) return notFound();
  if (order.userId !== session.user.id) return notFound();

  const address = order.shippingAddress as {
    fullName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    phoneNo?: string;
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold">Order Details</h1>
        <p className="text-muted-foreground text-xs sm:text-sm break-all">
          Order ID: {order.id}
        </p>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* summary card — show on TOP on mobile */}
      <div className="md:hidden">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs px-4 pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(Number(order.itemsPrice))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {Number(order.shippingPrice) === 0
                  ? "Free"
                  : formatCurrency(Number(order.shippingPrice))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(Number(order.taxPrice))}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>{formatCurrency(Number(order.totalPrice))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* left col */}
        <div className="md:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* shipping address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm sm:text-base">
                  Shipping Address
                </CardTitle>
              </div>
              {!order.isDelivered && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/shipping-address?redirect=/orders/${order.id}`}>
                    <Pencil className="w-3 h-3 mr-1" />
                    <span className="text-xs">Edit</span>
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-xs sm:text-sm px-4 pb-4">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <span className="text-muted-foreground">Full Name</span>
                <p className="font-medium">{address.fullName}</p>
                <span className="text-muted-foreground">Street</span>
                <p className="font-medium">{address.streetAddress}</p>
                <span className="text-muted-foreground">City</span>
                <p className="font-medium">
                  {address.city}, {address.postalCode}
                </p>
                {address.phoneNo && (
                  <>
                    <span className="text-muted-foreground">Phone</span>
                    <p className="font-medium">{address.phoneNo}</p>
                  </>
                )}
                <span className="text-muted-foreground">Country</span>
                <p className="font-medium">{address.country}</p>
              </div>
              <div className="mt-2">
                {order.isDelivered ? (
                  <Badge className="bg-green-500 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Delivered{" "}
                    {new Date(order.deliveredAt!).toLocaleDateString()}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-xs text-white">
                    <Clock className=" w-3 h-3 mr-1 animate-spin " />
                    Not Delivered
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* payment method */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm sm:text-base">
                  Payment Method
                </CardTitle>
              </div>
              {!order.isPaid && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/payment-method?redirect=/orders/${order.id}`}>
                    <Pencil className="w-3 h-3 mr-1" />
                    <span className="text-xs">Edit</span>
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs sm:text-sm px-4 pb-4">
              <p className="font-medium">{order.paymentMethod}</p>
              {order.isPaid ? (
                <Badge className="bg-green-500 w-fit text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid {new Date(order.paidAt!).toLocaleDateString()}
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="bg-red-500 w-fit text-xs">
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  Not Paid
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* order items */}
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm sm:text-base">
                  Order Items
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-xs sm:text-sm">
                      Item
                    </TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">
                      Qty
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">
                      Price
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="py-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center gap-2">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm">
                              {item.name.split(" ").length > 3
                                ? item.name.split(" ").slice(0, 3).join(" ") +
                                  "..."
                                : item.name}
                            </span>
                            {/* price under name on mobile */}
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {formatCurrency(Number(item.price))}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">
                        {item.qty}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">
                        {formatCurrency(Number(item.price))}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">
                        {formatCurrency(Number(item.price) * item.qty)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* right col — desktop only */}
        <div className="hidden md:block">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(order.itemsPrice))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shippingPrice) === 0
                    ? "Free"
                    : formatCurrency(Number(order.shippingPrice))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(Number(order.taxPrice))}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalPrice))}</span>
              </div>
              <Separator />

              {/* payment status */}
              {!order.isPaid && (
                <div className="flex flex-col gap-2">
                  {order.paymentMethod === "COD" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay when your order arrives
                      </p>
                    </div>
                  )}
                  {order.paymentMethod === "PayPal" && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="font-medium text-sm">PayPal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PayPal payment coming soon
                      </p>
                    </div>
                  )}
                  {order.paymentMethod === "Stripe" && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                      <p className="font-medium text-sm">Stripe</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stripe payment coming soon
                      </p>
                    </div>
                  )}
                </div>
              )}

              {order.isPaid && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-sm text-green-700">
                      Payment Confirmed
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paid on {new Date(order.paidAt!).toLocaleDateString()}
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/orders">View All Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* payment status + back button — mobile bottom */}
      <div className="md:hidden flex flex-col gap-3">
        {!order.isPaid && (
          <>
            {order.paymentMethod === "COD" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="font-medium text-sm">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay when your order arrives
                </p>
              </div>
            )}
            {order.paymentMethod === "PayPal" && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="font-medium text-sm">PayPal</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PayPal payment coming soon
                </p>
              </div>
            )}
            {order.paymentMethod === "Stripe" && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <p className="font-medium text-sm">Stripe</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stripe payment coming soon
                </p>
              </div>
            )}
          </>
        )}

        {order.isPaid && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="font-medium text-sm text-green-700">
                Payment Confirmed
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid on {new Date(order.paidAt!).toLocaleDateString()}
            </p>
          </div>
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link href="/orders">View All Orders</Link>
        </Button>
      </div>
    </div>
  );
}
