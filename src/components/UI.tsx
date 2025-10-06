// LoadingSpinner removed - now using skeleton screens instead
import { ThemeSelector } from "@/components/ThemeSelector";

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-strong rounded-xl p-6 border-2 border-red-300/50 dark:border-red-500/30">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">Error</h3>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="glass-hover px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBar({ 
  lastUpdated, 
  cached,
}: {
  lastUpdated: number | null;
  cached: boolean;
}) {
  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 glass-strong border-t border-white/20 dark:border-white/10 text-sm text-gray-700 dark:text-gray-200 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <span className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-glow" />
            <span>Updated {formatLastUpdated(lastUpdated)}</span>
          </span>
        )}
        {cached && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs glass border border-yellow-300/50 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-300 font-medium">
            ⚡ Cached
          </span>
        )}
      </div>
        <div className="flex items-center space-x-4">
          <ThemeSelector />
          <span>Made by <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" href="https://oliver.nederal.com" target="_blank" rel="noopener noreferrer">Oliver Nederal</a></span>
        </div>
      </div>
  );
}