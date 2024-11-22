"use client";
import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, NextUIProvider } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="flex items-center justify-center min-h-screen nextui-theme">
          <div className="flex flex-col items-start w-full max-w-[343px] min-w-[200px]">
            <motion.div
              layout
              className="w-full"
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Card>
                <CardBody className="overflow-hidden">
                  <Tabs
                    fullWidth
                    aria-label="Login options"
                    radius="full"
                    selectedKey={activeTab}
                    variant="solid"
                    onSelectionChange={handleTabChange}
                  >
                    <Tab key="login" title="Вход">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="login"
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <LoginForm />
                        </motion.div>
                      </AnimatePresence>
                    </Tab>
                    <Tab key="sign-up" title="Регистрация">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="sign-up"
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RegisterForm />
                        </motion.div>
                      </AnimatePresence>
                    </Tab>
                  </Tabs>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
