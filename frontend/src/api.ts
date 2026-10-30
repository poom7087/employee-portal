import type { Change, Profile } from "./types";
const base = "/api/v1";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(base + path, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Something went wrong. Please try again.");
  }
  return response.json();
}
export const api = {
  profile: () => request<Profile>("/profile"),
  skills: async () =>
    (await request<{ skills: string[] }>("/config/skills")).skills,
  history: () =>
    request<{ items: Change[]; retentionDays: number }>("/profile/history"),
  update: (data: Pick<Profile, "contact" | "skills">) =>
    request<Profile>("/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  photo: (file: File) => {
    const body = new FormData();
    body.append("photo", file);
    return request<Profile>("/profile/photo", { method: "POST", body });
  },
};
