import "server-only";
import type { Address } from "viem";
import type { CleanverseCreds } from "./client";

export const ASSAY_CHAIN = "monad" as const;
export const DEFAULT_MONAD_ATOKEN = "0xfa96de5b8f434c26fdff953303dd66ff80af1026" as Address;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Assay is not configured: missing ${name}`);
  return value;
}

export function platformCleanverseCreds(): CleanverseCreds {
  return {
    apiId: required("CLEANVERSE_API_ID"),
    apiKey: required("CLEANVERSE_API_KEY"),
    baseUrl: process.env.CLEANVERSE_API_BASE_URL?.trim() || "https://uatapi.cleanverse.com/api/cooperate",
  };
}

export function platformATokenAddress(): Address {
  const value = process.env.ASSAY_ATOKEN_ADDRESS?.trim() || process.env.ASSAY_DEMO_ATOKEN_ADDRESS?.trim();
  if (!value) return DEFAULT_MONAD_ATOKEN;
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) throw new Error("ASSAY_ATOKEN_ADDRESS is invalid");
  return value as Address;
}
