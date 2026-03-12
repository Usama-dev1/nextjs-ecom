// app/(root)/orders/page.tsx
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSessionAction } from "@/lib/actions/auth.action"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShoppingBag } from "lucide-react"

export default async function OrdersPage() {
  // check login
  const session = await getSessionAction()
  if (!session?.success) redirect("/login")

  // fetch all user orders latest first
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* header */}
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6" />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {/* empty state */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">You have no orders yet</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>

                    {/* order id — truncated */}
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>

                    {/* date */}
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </TableCell>

                    {/* item count */}
                    <TableCell className="text-sm">
                      {order.orderItems.reduce((acc, i) => acc + i.qty, 0)} items
                    </TableCell>

                    {/* total */}
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(Number(order.totalPrice))}
                    </TableCell>

                    {/* paid status */}
                    <TableCell>
                      {order.isPaid ? (
                        <Badge className="bg-green-500">Paid</Badge>
                      ) : (
                        <Badge variant="destructive">Unpaid</Badge>
                      )}
                    </TableCell>

                    {/* delivery status */}
                    <TableCell>
                      {order.isDelivered ? (
                        <Badge className="bg-green-500">Delivered</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>

                    {/* view button */}
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>View</Link>
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* mobile cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 flex flex-col gap-3">

                {/* order id + date */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-bold text-sm">
                    {formatCurrency(Number(order.totalPrice))}
                  </span>
                </div>

                {/* items count + method */}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>
                    {order.orderItems.reduce((acc, i) => acc + i.qty, 0)} items
                  </span>
                  <span>•</span>
                  <span>{order.paymentMethod}</span>
                </div>

                {/* badges */}
                <div className="flex gap-2">
                  {order.isPaid ? (
                    <Badge className="bg-green-500 text-xs">Paid</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Unpaid</Badge>
                  )}
                  {order.isDelivered ? (
                    <Badge className="bg-green-500 text-xs">Delivered</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  )}
                </div>

                {/* view button */}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/orders/${order.id}`}>View Order</Link>
                </Button>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}