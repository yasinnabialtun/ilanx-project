"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Editor ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-neutral-950 p-4 text-neutral-100">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-neutral-900 p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <h1 className="text-xl font-bold text-neutral-50 mb-2">
              Editör Yüklenirken Bir Hata Oluştu
            </h1>
            
            <p className="text-sm text-neutral-400 mb-6">
              WebGL veya çizim motoru (Fabric.js) ilklendirilirken bir sorun yaşandı. Tarayıcınızın donanım ivmesini desteklediğinden emin olun.
            </p>

            {this.state.error && (
              <div className="mb-6 max-h-32 overflow-auto rounded-lg bg-neutral-950 p-3 text-left text-xs font-mono text-red-400 border border-neutral-800">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                Sayfayı Yenile ve Tekrar Dene
              </button>
              
              <a
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                Ana Sayfaya Dön
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
