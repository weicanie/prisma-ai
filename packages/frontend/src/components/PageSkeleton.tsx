export default function PageSkeleton() {
	return (
		<div className="p-4 space-y-4">
			<div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
			<div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
			<div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
			<div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
		</div>
	);
}
