import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { InstallPromptAutoShow, InstallButton } from "@/features/pwa";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ThemeProvider>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <InstallPromptAutoShow />
      <InstallButton />

      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </ThemeProvider>
  );
}
