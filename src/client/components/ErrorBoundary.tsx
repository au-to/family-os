import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">⚠️</div>
          <h2>页面渲染异常</h2>
          <p className="error-boundary-message">
            {this.state.error?.message || '发生了意外错误'}
          </p>
          <button className="btn btn-primary" onClick={this.handleRetry}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
