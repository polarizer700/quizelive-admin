import { Outlet, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { LegalLinks } from "@widgets/legal-links";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      {/* Десктопный сайдбар */}
      <motion.aside
        className="sticky top-0 z-10 hidden h-screen border-r-[3px] border-ink bg-white md:block"
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Sidebar />
      </motion.aside>

      {/* Мобильная шторка */}
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.button
              type="button"
              aria-label="Закрыть меню"
              className="absolute inset-0 bg-ink/50"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto border-r-[3px] border-ink bg-white"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-xl border-[3px] border-ink bg-paper text-ink shadow-[2px_2px_0_#111] transition hover:bg-acid"
              >
                <X size={16} />
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <main className="flex min-h-screen flex-col px-4 py-4 md:px-8 md:py-8">
        <Header onMenuOpen={() => setDrawerOpen(true)} />

        <div className="flex-1">
          <Outlet />
        </div>
        <LegalLinks className="mt-10 border-t-[3px] border-ink pt-4" />
      </main>
    </div>
  );
}
