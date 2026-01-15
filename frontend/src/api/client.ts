// frontend/src/api/client.ts
import createClient from "openapi-fetch";
import { camelizeKeys, decamelizeKeys } from "humps";
import type { paths } from "@/types/api";

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000/api";

export const client = createClient<paths>({
  baseUrl: API_URL,
  credentials: "include",
});

client.use({
  async onRequest({ request }) {
    const cloned = request.clone();

    try {
      const bodyText = await cloned.text();
      if (bodyText) {
        const bodyJson = JSON.parse(bodyText);
        const transformedBody = decamelizeKeys(bodyJson);

        const headers = new Headers(request.headers);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        return new Request(request.url, {
          method: request.method,
          headers: headers,
          body: JSON.stringify(transformedBody),
          credentials: request.credentials,
          mode: request.mode,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer,
          integrity: request.integrity,
        });
      }
    } catch (e) {
      // If not JSON, pass through unchanged
    }

    return request;
  },

  async onResponse({ response }) {
    if (response.body) {
      try {
        const clonedResponse = response.clone();
        const json = await clonedResponse.json();
        const transformedData = camelizeKeys(json);

        return new Response(JSON.stringify(transformedData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (e) {
        return response;
      }
    }
    return response;
  },
});

export default client;
