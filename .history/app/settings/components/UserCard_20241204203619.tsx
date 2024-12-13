/* eslint-disable no-console */
import { Button } from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";

import { signOut } from "@/utils/supabase";

interface UserCardProps {
  email: string | undefined;
}

export function UserCard({ email }: UserCardProps) {
  return (
    <Card shadow="none">
      <CardBody>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">{email}</div>
          <Button
            variant="flat"
            onClick={async () => {
              try {
                await signOut();
                window.location.href = "/";
              } catch (error) {
                console.error("Ошибка при выходе:", error);
              }
            }}
          >
            Выйти
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
