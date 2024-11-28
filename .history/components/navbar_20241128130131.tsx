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
  return (
    <NextUINavbar
      className="h-12 bg-transparent fixed top-0 left-0 right-0 z-50"
      maxWidth="full"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">Tender Ninja</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <ThemeSwitch />
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <Button
          isIconOnly
          radius="md"
          size="sm"
          variant="light"
        >
          <User size={20} />
        </Button>
        <NavbarMenuToggle />
      </NavbarContent>
    </NextUINavbar>
  );
};
