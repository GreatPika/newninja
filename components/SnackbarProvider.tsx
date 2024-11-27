"use client";

import React from "react";
import { SnackbarProvider } from "notistack";

interface Props {
  children: React.ReactNode;
}

const CustomSnackbarProvider: React.FC<Props> = ({ children }) => {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={5000}
      maxSnack={3}
    >
      {children}
    </SnackbarProvider>
  );
};

export default CustomSnackbarProvider;
