import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry, title = 'Something went wrong' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-900/10 rounded-xl border border-red-500/20 w-full">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-md">
        {error?.message || error || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
