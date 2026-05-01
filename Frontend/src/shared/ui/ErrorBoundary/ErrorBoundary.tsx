/**
 * @file shared/ui/ErrorBoundary/ErrorBoundary.tsx
 * @description React Error Boundary — يلتقط أخطاء Runtime ويعرض Fallback UI
 *
 * لماذا Class Component؟
 * لا يوجد مكافئ Hook لـ componentDidCatch حتى الآن في React.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
  onError?:  (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Basira ErrorBoundary]', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)' }}
          >
            <AlertTriangle size={32} style={{ color: '#f43f5e' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-slate-400 max-w-sm">
              {this.state.error?.message ?? 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-80 cursor-pointer"
            style={{ background: 'var(--color-brand-600)' }}
          >
            <RefreshCw size={14} />
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
