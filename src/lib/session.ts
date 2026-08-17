import { z } from "zod";

export const SESSION_HEADER = "x-session-id";
export const SESSION_STORAGE_KEY = "monthly-spend-tracker:session-id";

export const sessionIdSchema = z.uuid();
