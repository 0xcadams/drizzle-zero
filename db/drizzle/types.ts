import { z } from "zod";

export const shortCodeBrand = Symbol("ShortCode");

export type ShortCodeType = string & {};

export type ShortCodeValue = string &
  Record<typeof shortCodeBrand, ShortCodeType>;

export const getShortCode = (value: string) => {
  return value as ShortCodeValue;
};

export type NonEmptyArray<T> = [T, ...T[]];

export const releaseTrackEnum = z.enum(["alpha", "beta", "ga", "sunset"]);
export type ReleaseTrack = z.infer<typeof releaseTrackEnum>;

export const notificationPreferenceSchema = z.discriminatedUnion("channel", [
  z.object({
    channel: z.literal("email"),
    address: z.string().email(),
    templateId: z.string().uuid().optional(),
  }),
  z.object({
    channel: z.literal("sms"),
    countryCode: z.string().regex(/^\+\d{1,3}$/),
    number: z.string(),
    dndHours: z
      .tuple([z.number().min(0).max(23), z.number().min(0).max(23)])
      .optional(),
  }),
  z.object({
    channel: z.literal("push"),
    deviceTokens: z.array(z.string()).min(1),
    platform: z.enum(["ios", "android", "web"]),
  }),
  z.object({
    channel: z.literal("webhook"),
    endpoint: z.string().url(),
    secretVersion: z.number().int().optional(),
  }),
]);
export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;
export type NotificationPreferences = NonEmptyArray<NotificationPreference>;

export const runtimeFlagSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("boolean"),
    defaultValue: z.boolean(),
    description: z.string().optional(),
  }),
  z.object({
    kind: z.literal("percentage"),
    steps: z
      .array(
        z.object({
          percentage: z.number().min(0).max(1),
          value: z.boolean(),
        }),
      )
      .min(1),
    holdouts: z.array(z.string()).optional(),
  }),
  z.object({
    kind: z.literal("payload"),
    payload: z.record(z.string(), z.any()),
    schemaVersion: z.number().int().positive().default(1),
  }),
]);
export type RuntimeFlagDefinition = z.infer<typeof runtimeFlagSchema>;

export interface FeatureFlag {
  key: string;
  track: ReleaseTrack;
  definition: RuntimeFlagDefinition;
  audiences: NotificationPreference[];
  rolloutStrategy: "gradual" | "immediate" | "shadow";
  updatedAtIso: string;
}

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DeepReadonly<T> = T extends
  | Primitive
  | ((...args: never[]) => unknown)
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

export type FeatureFlagSnapshot = DeepReadonly<FeatureFlag>;

export type WorkflowState =
  | { state: "draft"; updatedBy: string }
  | {
      state: "scheduled";
      updatedBy: string;
      runAtIso: string;
      timezone?: string;
    }
  | { state: "running"; jobId: string; startedAtIso: string; attempt: number }
  | { state: "failed"; failedAtIso: string; reason: string; retryable: boolean }
  | {
      state: "completed";
      finishedAtIso: string;
      outputs?: Record<string, unknown>;
    };

export const analyticsQuerySchema = z.object({
  dimensions: z.array(z.enum(["hour", "day", "week", "month"])).nonempty(),
  metrics: z.array(z.string()).nonempty(),
  filters: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin"]),
        value: z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.union([z.string(), z.number()])),
        ]),
      }),
    )
    .optional(),
  limit: z.number().int().min(1).max(5000).default(500),
  timezone: z.string().default("UTC"),
});
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export const cdcCheckpointSchema = z.object({
  lastLsn: z.string(),
  snapshotCompleted: z.boolean(),
  hydratedAtIso: z.string(),
});
export type ChangeDataCaptureCheckpoint = z.infer<typeof cdcCheckpointSchema>;

export type TemporalRollup<TPayload> = {
  window: "1h" | "6h" | "24h" | "7d";
  aggregate: "avg" | "sum" | "p95" | "count";
  datapoints: NonEmptyArray<{
    atIso: string;
    value: number;
    payload?: TPayload;
  }>;
};

export type WebhookRetryPolicy =
  | { mode: "linear"; intervalSeconds: number; attempts: number }
  | {
      mode: "exponential";
      baseIntervalSeconds: number;
      factor: number;
      maxAttempts: number;
    };

export interface WebhookConfig {
  name: string;
  version: number;
  secretRef: string;
  retryPolicy: WebhookRetryPolicy;
  filters?: string[];
}

export type AuditDiff =
  | { op: "set"; path: string; value: unknown }
  | { op: "remove"; path: string }
  | { op: "increment"; path: string; by: number };

export type SchemaDriftFinding = {
  severity: "info" | "warning" | "error";
  diffs: NonEmptyArray<AuditDiff>;
  detectedAtIso: string;
  acknowledgedBy?: string;
};
