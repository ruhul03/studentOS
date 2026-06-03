import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, message, onRetry, title = 'Something went wrong' }) => {
  const displayMessage = message || error?.message || error || 'An unexpected error occurred. Please try again.';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-error/10 rounded-xl border border-error/20 w-full">
      <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">{title}</h3>
      <p className="text-on-surface-variant text-sm mb-6 max-w-md">
        {displayMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-error hover:bg-error/80 text-on-error font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

