// frontend/src/api/client.ts
import createClient from "openapi-fetch";
import { camelizeKeys, decamelizeKeys } from "humps";
import type { paths } from "@/types/api";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:8000/");

// Create the base client with full type safety
export const client = createClient<paths>({
  baseUrl: API_URL,
  credentials: "include",
});

// Add middleware to automatically transform requests and responses
client.use({
  async onRequest({ request }) {
    // Transform request body from camelCase to snake_case
    if (request.body) {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          const bodyJson = JSON.parse(bodyText);
          const transformedBody = decamelizeKeys(bodyJson);

          // Preserve headers and ensure Content-Type is set
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
    }
    return request;
  },

  async onResponse({ response }) {
    // Transform response body from snake_case to camelCase
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
        // If not JSON, return original response
        return response;
      }
    }
    return response;
  },
});

export default client;
