"use client";
import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import LoginForm from "@/app/LoginPage/LoginForm";
import RegisterForm from "@/app/LoginPage/RegisterForm";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("login");

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as string);
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" value={{}}>
      <NextUIProvider>
        <div className="flex items-center justify-center w-full min-h-screen nextui-theme">
          <Card disableAnimation>
            <CardBody className="overflow-hidden w-[343px]">
              <Tabs
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
        </div>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
