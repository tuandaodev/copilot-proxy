import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { startLogin, startPolling } from "@/server/token-resource.js";
import * as tokenStorage from "@/server/libs/token-store/token-storage.js";

export const POST = async (event: APIEvent) => {
  const stream = new ReadableStream({
    async start(controller) {
      const jsonWriter = (obj) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(obj) + "\n")
        );
        return obj;
      };
      await startLogin().then(jsonWriter);
      const { accessToken } = await startPolling().then(jsonWriter);
      if (accessToken) {
        await tokenStorage.storeToken({
          name: `Token-${Date.now()}`,
          token: accessToken,
        });
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
};
