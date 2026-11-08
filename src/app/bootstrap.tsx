import { useEffect, useState } from "react";

import { bootstrapSession } from "@entities/session";

import { AppProviders } from "./providers";

export function Bootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void bootstrapSession().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-stone-500">Загрузка…</div>;
  }

  return <AppProviders />;
}
