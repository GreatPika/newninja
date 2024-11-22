"use client";

import dynamic from "next/dynamic";

// Динамически импортируем Navbar без SSR
const NavbarComponent = dynamic(() => import("./NavbarContent"), { 
  ssr: false 
});

export const Navbar = () => {
  return <NavbarComponent />;
};
