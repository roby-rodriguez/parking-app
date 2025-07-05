import React from 'react';
import { ActionDefinition, ColumnDefinition } from './DataView';
import DataViewActions from './DataViewActions';

interface DataViewTableProps<T> {
	data: T[];
	columns: ColumnDefinition<T>[];
	actions: ActionDefinition<T>[];
	className?: string;
}

const DataViewTable = <T extends { id: string }>({
	data,
	columns,
	actions,
	className = '',
}: DataViewTableProps<T>) => {
	return (
		<div className={`overflow-x-auto ${className}`}>
			<table className="w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						{columns.map((column) => (
							<th
								key={column.key}
								className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
									column.width || 'w-auto'
								}`}
							>
								{column.label}
							</th>
						))}
						{actions.length > 0 && (
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
								Actions
							</th>
						)}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{data.map((item) => {
						// Filter visible actions for this item
						const visibleActions = actions.filter((action) => !action.hidden?.(item));

						return (
							<tr key={item.id} className="hover:bg-gray-50">
								{columns.map((column) => (
									<td
										key={column.key}
										className="px-4 py-4 text-left text-sm text-gray-900"
									>
										{column.render(item)}
									</td>
								))}
								{actions.length > 0 && (
									<td className="px-4 py-4 text-sm text-gray-900">
										{visibleActions.length > 0 ? (
											<DataViewActions actions={visibleActions} item={item} className="flex space-x-2" />
										) : (
											<span className="text-gray-400">-</span>
										)}
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default DataViewTable;
