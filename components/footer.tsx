import { APP_TITLE } from "@/lib/constants";

const Footer = () => {
  const year: number = new Date().getFullYear();
  return (
    <footer className="mt-4 shadow-md  border-t-[0.5] bg-background text-foreground py-2 text-center">
      <div className="flex p-1 shadow-lg justify-center items-center">
        © {year} {APP_TITLE}. All rights reserved.
      </div>
    </footer>
  );
};
export default Footer;
