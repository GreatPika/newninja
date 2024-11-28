/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing env variables for Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw error;

  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: "https://www.tenderninja.co/", // Укажите URL редиректа
    },
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("user_profile")
    .select("balance, email")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

interface TokenUsageData {
  created_at: string;
  total_cost: number;
}

export async function getTokenUsage(userId: string): Promise<TokenUsageData[]> {
  const { data, error } = await supabase
    .from("token_usage")
    .select("created_at, total_cost")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
