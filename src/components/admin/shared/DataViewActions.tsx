import React from 'react';
import { ActionDefinition } from './DataView';

interface DataViewActionsProps<T> {
	actions: ActionDefinition<T>[];
	item: T;
	className?: string;
}

function getButtonClasses(variant?: string) {
	switch (variant) {
		case 'primary':
			return 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500';
		case 'secondary':
			return 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500';
		case 'danger':
			return 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500';
		case 'neutral':
			return 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500';
		default:
			return 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500';
	}
}

const DataViewActions = <T, >({
	actions,
	item,
	className = 'flex space-x-2',
}: DataViewActionsProps<T>) => {
	if (!actions.length) {
		return null;
	}
	return (
		<div className={className}>
			{actions.map((action) => (
				<button
					key={action.key}
					onClick={() => action.onClick(item)}
					disabled={action.disabled?.(item)}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClasses(action.variant)}${action.disabled?.(item) ? ' opacity-50 cursor-not-allowed' : ''}`}
				>
					{action.label}
				</button>
			))}
		</div>
	);
};

export default DataViewActions;
