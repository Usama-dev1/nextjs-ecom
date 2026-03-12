"use client";
import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/auth/useSession";
import { logoutAction } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";



const Menu = () => {
  const { data, fetchSession,cartQty ,refreshCart} = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      fetchSession();
      refreshCart()
      router.refresh()
      router.push("/");
    }
  };
  return (
    <div className="flex justify-end gap-3 me-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button variant="ghost" asChild className="text-foreground">
          <Link href="/cart" className="text-foreground">
            <span className="flex items-center gap-2">
              <span className="relative">
                <ShoppingCart className="w-10 h-10 text-foreground" />
                {cartQty > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cartQty > 99 ? "99+" : cartQty}
                  </span>
                )}
              </span>
              {/* <span className="text-foreground">Cart</span> */}
            </span>
          </Link>
        </Button>
        {data?.success ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-sm">
              <span className="font-medium">{data?.user?.name}</span>
              <span className="text-muted-foreground !text-xs">
                {data?.user?.email}
              </span>
            </div>
            <Button
              size="sm"
              className="px-4 py-1 text-xs"
              onClick={handleLogout}>
              <UserIcon className="w-2 h-2 text-background" />
              <span className=" text-xxs text-background ">Logout</span>
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/register">
              <span className="flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-background" />
                <span className="text-background">Sign-in</span>
              </span>
            </Link>
          </Button>
        )}
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-end" asChild>
            <button aria-label="Open menu">
              <EllipsisVertical />
            </button>
          </SheetTrigger>

          <SheetContent className="flex flex-col w-64 p-6 gap-4">
            <SheetTitle className="text-left">Menu</SheetTitle>

            {/* user info or sign in */}
            {data?.success ? (
              <div className="flex flex-col gap-1 border-b pb-4">
                <span className="font-medium text-sm">{data.user?.name}</span>
                <span className="text-muted-foreground text-xs">
                  {data.user?.email}
                </span>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link href="/register">
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
            )}

            {/* cart link */}
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/cart">
                <span className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartQty > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {cartQty > 99 ? "99+" : cartQty}
                    </span>
                  )}
                </span>
                <span className="ml-2">
                  Cart {cartQty > 0 && `(${cartQty})`}
                </span>
              </Link>
            </Button>

            {/* profile + orders — only when logged in */}
            {data?.success && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start">
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start">
                  <Link href="/orders">
                    <UserIcon className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                </Button>
              </>
            )}

            {/* theme toggle */}
            <div className="w-full ms-2 flex items-center justify-start ">
              <ModeToggle />
              <span className="text-sm">Theme</span>
            </div>

            {/* logout — bottom */}
            {data?.success && (
              <Button
                variant="destructive"
                className="w-full mt-auto"
                onClick={handleLogout}>
                <UserIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}

            <SheetDescription />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};
export default Menu;
