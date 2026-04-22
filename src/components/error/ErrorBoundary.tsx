import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary - captura crashes em qualquer componente filho e
 * renderiza UI de recuperacao ao inves de tela branca.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Log para observabilidade
    console.error('[ErrorBoundary] Captured:', error, errorInfo);

    // Persiste ultimo erro para diagnostico
    try {
      localStorage.setItem('v4_pitwall_last_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }));
    } catch {
      // ignore
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }

    const errorMsg = this.state.error?.message ?? 'Erro desconhecido';
    const stackShort = this.state.error?.stack?.split('\n').slice(0, 5).join('\n') ?? '';

    const copyError = () => {
      const text = `V4 PIT WALL Error Report\n\nMessage: ${errorMsg}\n\nStack:\n${stackShort}\n\nComponent:\n${this.state.errorInfo?.componentStack ?? ''}\n\nTimestamp: ${new Date().toISOString()}\nURL: ${window.location.href}`;
      navigator.clipboard.writeText(text);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="w-full max-w-lg bg-[#1a1a24] border border-red-500/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <h1 className="text-sm font-semibold text-slate-200">Algo deu errado</h1>
              <p className="text-[10px] text-slate-500">Um componente travou mas a app continua rodando</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 font-mono break-all">{errorMsg}</p>
            </div>

            {stackShort && (
              <details className="text-[10px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-300">Detalhes tecnicos</summary>
                <pre className="mt-2 p-2 bg-slate-900 rounded text-[9px] overflow-x-auto whitespace-pre-wrap">{stackShort}</pre>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                <RefreshCw size={12} />
                Tentar novamente
              </button>
              <button
                onClick={copyError}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                <Copy size={12} />
                Copiar erro
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Recarregar app
              </button>
            </div>

            <p className="text-[10px] text-slate-600 pt-2 border-t border-slate-800">
              Se o erro persiste: copie o relatorio e envie para suporte, ou recarregue a app. Seus dados localStorage estao preservados.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
