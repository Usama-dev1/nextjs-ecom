"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.svg";
import { APP_TITLE } from "@/lib/constants";
import dynamic from "next/dynamic";

const Menu = dynamic(() => import("./menu"),
  { ssr: false, loading: () => <div>Loading menu...</div> }
);
const Header = () => {
  return (
    <nav className="bg-background text-foreground shadow-md py-5 px-4 flex border-b-3 justify-between items-center m-0">
      <div className=" flex space-x-3">
        <Link href="/">
          <Image
            src={logo}

            width={30}
            height={7}
            alt={`${APP_TITLE} logo`}
          />
        </Link>
        <span className="hidden lg:block text-xl font-semibold">
          E-Commerce
        </span>
      </div>
      <Menu />
    </nav>
  );
};
export default Header;
