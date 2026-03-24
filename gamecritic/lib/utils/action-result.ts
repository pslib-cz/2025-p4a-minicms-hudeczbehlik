import { ZodError } from "zod";

import type { ActionResult } from "@/types";

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

export function zodFail(error: ZodError): ActionResult<never> {
  return {
    success: false,
    error: "Validation failed",
    fieldErrors: error.flatten().fieldErrors,
  };
}
