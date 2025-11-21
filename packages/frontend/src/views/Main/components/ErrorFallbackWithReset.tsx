import { useErrorBoundary } from 'react-error-boundary';

export const ErrorFallbackWithReset: React.FC<{ error: any }> = ({ error }) => {
	const { resetBoundary } = useErrorBoundary();

	return (
		<div className="flex flex-col items-center justify-center gap-3 pt-3">
			<pre style={{ color: 'red' }}>{error?.message}</pre>
			<button
				onClick={resetBoundary}
				className="w-30 h-9 rounded-3xl text-sm border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
			>
				点击重试
			</button>
		</div>
	);
};
