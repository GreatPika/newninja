"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
} from "@nextui-org/navbar";
import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import { User } from "lucide-react";

import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  const userButton = (
    <Button isIconOnly radius="md" variant="light">
      <User size={20} />
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
        <ThemeSwitch />
        {userButton}
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>
    </NextUINavbar>
  );
};
