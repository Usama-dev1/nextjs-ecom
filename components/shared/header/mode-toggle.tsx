"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { SunIcon, MoonIcon,SunMoonIcon } from "lucide-react";
const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  if (!theme) {
    return null;
  }
  return (
    //how this works drop menu>then dropdown trigger for logo>then content>checkbox items for each theme
    <DropdownMenu >
      <DropdownMenuTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0" asChild>
        <Button className="text-foreground" variant="ghost">
          {theme === "system" ? (
            <SunMoonIcon className="text-foreground" />
          ) : theme === "light" ? (
            <SunIcon className="text-foreground" />
          ) : (
            <MoonIcon className="text-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
            className="w-full justify-start"
            checked={theme === "light"}
            onClick={() => setTheme("light")}
          >
            Light
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
            checked={theme === "dark"}
            className="w-full justify-start"
            onClick={() => setTheme("dark")}
            >
            Dark
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
            className="w-full justify-start"
            checked={theme === "system"}
            onClick={() => setTheme("system")}
            >
            System
            </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ModeToggle;
