"use server";

import {
  createApiKeysMutationFn,
  getApiKeysMutationFn,
} from "@/lib/api-mutations";
import type { ApiKeysResponseType } from "@/types/api-key.type";

export async function getApiKeysAction(): Promise<ApiKeysResponseType> {
  return getApiKeysMutationFn();
}

export async function createApiKeysAction(): Promise<ApiKeysResponseType> {
  return createApiKeysMutationFn();
}
