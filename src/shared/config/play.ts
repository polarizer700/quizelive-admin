export function playPublicURL() {
  const raw = import.meta.env.VITE_PLAY_PUBLIC_URL as string | undefined;
  return (raw?.replace(/\/$/, "") || "http://localhost:5175");
}

export function tvDeepLink(token: string) {
  return `${playPublicURL()}/tv?token=${encodeURIComponent(token)}`;
}
