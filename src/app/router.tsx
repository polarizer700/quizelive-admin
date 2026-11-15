import { createRootRoute, createRoute, createRouter, Outlet, redirect } from "@tanstack/react-router";

import { canEditQuizzes, canManageUsers, useSessionStore } from "@entities/session";
import { ForgotPasswordPage } from "@pages/forgot-password";
import { LoginPage } from "@pages/login";
import { RegisterPage } from "@pages/register";
import { ResetPasswordPage } from "@pages/reset-password";
import { GamesPage } from "@pages/games";
import { GameViewPage } from "@pages/game-view";
import { QuizCreatePage } from "@pages/quiz-create";
import { QuizEditorPage } from "@pages/quiz-editor";
import { QuizzesPage } from "@pages/quizzes";
import { UsersPage } from "@pages/users";
import { VerifyEmailPage } from "@pages/verify-email";
import { AppShell } from "@widgets/app-shell";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: useSessionStore.getState().accessToken ? "/quizzes" : "/login" });
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: () => {
    if (useSessionStore.getState().accessToken) throw redirect({ to: "/quizzes" });
  },
  component: RegisterPage,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: VerifyEmailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (useSessionStore.getState().accessToken) throw redirect({ to: "/quizzes" });
  },
  component: LoginPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  beforeLoad: () => {
    if (useSessionStore.getState().accessToken) throw redirect({ to: "/quizzes" });
  },
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: () => {
    if (!useSessionStore.getState().accessToken) throw redirect({ to: "/login" });
  },
  component: AppShell,
});

const quizzesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "quizzes",
  component: QuizzesPage,
});

const quizCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "quizzes/new",
  beforeLoad: () => {
    if (!canEditQuizzes(useSessionStore.getState().user?.role)) throw redirect({ to: "/quizzes" });
  },
  component: QuizCreatePage,
});

const quizRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "quizzes/$quizId",
  component: QuizEditorPage,
});

const gamesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "games",
  component: GamesPage,
});

const gameViewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "games/$gameId",
  component: GameViewPage,
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "users",
  beforeLoad: () => {
    if (!canManageUsers(useSessionStore.getState().user?.role)) throw redirect({ to: "/quizzes" });
  },
  component: UsersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  registerRoute,
  verifyRoute,
  appRoute.addChildren([quizzesRoute, quizCreateRoute, quizRoute, gamesRoute, gameViewRoute, usersRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-stone-600">Страница не найдена</div>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
