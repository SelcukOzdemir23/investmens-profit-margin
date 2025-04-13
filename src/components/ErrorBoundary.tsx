import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error }: { error?: Error }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-red-500">
          {t("errorOccurred")}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("errorDescription")}
        </p>
        {error && (
          <pre className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error.message}
          </pre>
        )}
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          {t("refreshPage")}
        </Button>
      </div>
    </div>
  );
};

export default ErrorBoundary;