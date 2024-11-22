"use client";
import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import LoginForm from "../components/LoginPage/LoginForm";
import RegisterForm from "../components/LoginPage/RegisterForm";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("login");

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as string);
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" value={{}}>
      <NextUIProvider>
          <Card disableAnimation className="flex items-center justify-center w-full min-h-screen nextui-theme">
            <CardBody className="overflow-hidden">
              <Tabs
                disableAnimation
                fullWidth
                aria-label="Login options"
                radius="full"
                selectedKey={activeTab}
                variant="solid"
                onSelectionChange={handleTabChange}
              >
                <Tab key="login" title="Вход">
                  {activeTab === "login" && <LoginForm />}
                </Tab>
                <Tab key="sign-up" title="Регистрация">
                  {activeTab === "sign-up" && <RegisterForm />}
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
