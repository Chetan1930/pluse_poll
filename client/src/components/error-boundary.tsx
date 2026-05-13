import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. You can try again or head back to the home page.
            </p>
            {this.state.error && (
              <details className="mt-4 group">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto w-fit rounded-lg border border-border/60 px-3 py-1.5">
                  Error details
                </summary>
                <pre className="mt-2 rounded-xl bg-muted/50 border border-border/60 p-3 text-xs text-left text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack?.split("\n").slice(0, 4).join("\n")}
                </pre>
              </details>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
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

    return this.props.children;
  }
}
