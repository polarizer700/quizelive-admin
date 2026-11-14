import { create } from "zustand";

import type { User } from "./types";

const sessionHintKey = "quizelive_session_hint";

type SessionState = {
  accessToken: string | null;
  user: User | null;
  setSession: (accessToken: string, user: User) => void;
  clear: () => void;
};

export function hasSessionHint() {
  try {
    return localStorage.getItem(sessionHintKey) === "1";
  } catch {
    return false;
  }
}

function writeSessionHint(on: boolean) {
  try {
    if (on) localStorage.setItem(sessionHintKey, "1");
    else localStorage.removeItem(sessionHintKey);
  } catch {
    // ignore private mode
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => {
    writeSessionHint(true);
    set({ accessToken, user });
  },
  clear: () => {
    writeSessionHint(false);
    set({ accessToken: null, user: null });
  },
}));
