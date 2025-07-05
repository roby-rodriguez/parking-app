import React, { useState } from 'react';
import { ActionDefinition, ColumnDefinition } from './DataView';
import DataViewActions from './DataViewActions';

interface DataViewCardProps<T> {
	item: T;
	columns: ColumnDefinition<T>[];
	cardContentKeys?: string[];
	actions: ActionDefinition<T>[];
	cardHeaderRenderer?: (item: T) => React.ReactNode;
}

const DataViewCard = <T extends { id: string }>({
	item,
	columns,
	cardContentKeys,
	actions,
	cardHeaderRenderer,
}: DataViewCardProps<T>) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => setIsExpanded(!isExpanded);

	// Filter visible actions
	const visibleActions = actions.filter((action) => !action.hidden?.(item));

	// Determine which columns to show in card content
	const contentColumns = cardContentKeys
		? cardContentKeys
			.map((key) => columns.find((col) => col.key === key))
			.filter((col): col is ColumnDefinition<T> => !!col)
		: columns;

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
			{/* Header - Always visible */}
			<button
				onClick={toggleExpanded}
				className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
				aria-expanded={isExpanded}
				aria-controls={`data-card-${item.id}`}
			>
				<div className="flex items-center justify-between">
					{/* Custom header content */}
					{cardHeaderRenderer ? (
						cardHeaderRenderer(item)
					) : (
						<div className="flex items-center space-x-3">
							{/* Default header - first 2 columns */}
							<div className="flex flex-col space-y-1">
								{columns.slice(0, 2).map((column) => (
									<div key={column.key} className="flex items-center space-x-2">
										<span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
											{column.label}:
										</span>
										<span className="text-sm text-gray-900">
											{column.render(item)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Chevron */}
					<svg
						className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
							isExpanded ? 'rotate-180' : ''
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</button>

			{/* Collapsible Content */}
			{isExpanded && (
				<div id={`data-card-${item.id}`} className="border-t border-gray-200 bg-white">
					<div className="px-4 pb-2">
						{/* Table-like label-value rows for selected columns */}
						{contentColumns.map((column, idx) => {
							const isLast = idx === contentColumns.length - 1;
							return (
								<div
									key={column.key}
									className={`flex justify-between items-center py-2${!isLast || visibleActions.length > 0 ? ' border-b border-gray-100' : ''}`}
								>
									<span className="text-gray-600 text-sm font-medium">
										{column.label}:
									</span>
									<span className="text-gray-900 text-sm">
										{column.render(item)}
									</span>
								</div>
							);
						})}

						{/* Actions - Centered */}
						{visibleActions.length > 0 && (
							<DataViewActions actions={visibleActions} item={item} className="flex justify-center pt-2 space-x-2" />
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default DataViewCard;
