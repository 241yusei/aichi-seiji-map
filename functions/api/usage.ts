import { handleUsageRequest, type UsageServerEnv } from "../../lib/usage-server";

// Structural Pages context keeps the receiver independent of a platform SDK/runtime.
export const onRequest = (context: { request: Request; env: UsageServerEnv }): Promise<Response> =>
  handleUsageRequest(context.request, context.env);
