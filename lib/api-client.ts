import { useAuthStore } from "./auth-store";

export interface ApiClientOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

function handleUnauthorized(): void {
  console.warn("[API Client] 401 Unauthorized - Logging out user");
  
  // Get the signOut action from the auth store
  const { signOut } = useAuthStore.getState();
  signOut();
}

export async function authenticatedFetch(
  url: string,
  accessToken: string,
  options: ApiClientOptions = {}
): Promise<Response> {
  const { headers = {}, ...restOptions } = options;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...headers,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}
