import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import appCss from "../styles.css?url";
import { StoreProvider } from "@/lib/api-store";
import { AuthProvider } from "@/lib/auth-store";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 gradient-mesh">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">This page didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading this page. You can try again or head back home.
        </p>
        {error && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto w-fit rounded-lg border border-border/60 px-3 py-1.5">
              Error details
            </summary>
            <pre className="mt-2 rounded-xl bg-muted/50 border border-border/60 p-3 text-xs text-left text-muted-foreground overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-background px-5 py-2.5 text-sm font-medium shadow-soft hover:bg-muted/50 transition-colors"
          >
            <Home className="h-4 w-4 mr-1.5" />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PulsePoll — Real-time polls & feedback that feel premium" },
      {
        name: "description",
        content:
          "PulsePoll is a modern polling and feedback platform with realtime analytics, beautiful charts, and a delightful builder.",
      },
      { property: "og:title", content: "PulsePoll — Real-time polls & feedback" },
      {
        property: "og:description",
        content: "Modern polls with realtime analytics and beautiful charts.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <Toaster position="top-right" richColors closeButton />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
