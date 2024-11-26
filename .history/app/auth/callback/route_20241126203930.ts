import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/chat`);
    }
  }

  // Перенаправление на страницу ошибки в случае неудачи
  return NextResponse.redirect(`${origin}/auth/error`);
}
