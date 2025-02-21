"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
} from "@heroui/navbar";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Settings, Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "@/app/chat/components/theme-switch";
import { exportMessagesToExcel } from "@/app/chat/utils/exportToExcel";

export const NavBar = () => {
  const router = useRouter();

  const userButton = (
    <Button
      isIconOnly
      radius="md"
      variant="light"
      onClick={() => router.push("/settings")}
    >
      <Settings size={22} strokeWidth={1.5} />
    </Button>
  );

  const downloadButton = (
    <Button
      isIconOnly
      radius="md"
      variant="light"
      onClick={exportMessagesToExcel}
    >
      <Download size={22} strokeWidth={1.5} />
    </Button>
  );

  return (
    <NextUINavbar
      className="h-12 bg-transparent fixed top-0 left-0 right-0 z-50"
      maxWidth="full"
    >
      <NavbarContent justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">Tender Ninja</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="gap-2" justify="end">
        <div className="flex">
          <ThemeSwitch />
          {downloadButton}
          {userButton}
        </div>
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>
    </NextUINavbar>
  );
};
