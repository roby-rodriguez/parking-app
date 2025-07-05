import React, { Fragment } from 'react';
import DataViewCard from './DataViewCard';
import DataViewTable from './DataViewTable';

export interface ColumnDefinition<T> {
	key: string;
	label: string;
	width?: string;
	render: (item: T) => React.ReactNode;
}

export interface ActionDefinition<T> {
	key: string;
	label: string;
	variant?: 'primary' | 'secondary' | 'neutral' | 'danger';
	onClick: (item: T) => void;
	disabled?: (item: T) => boolean;
	hidden?: (item: T) => boolean;
}

export interface DataViewProps<T> {
	title?: string;
	data: T[];
	columns: ColumnDefinition<T>[];
	actions?: ActionDefinition<T>[];
	emptyMessage?: string;
	className?: string;
	cardHeaderRenderer?: (item: T) => React.ReactNode;
	/**
	 * Optional array of column keys to display as rows in the card content (in order).
	 * If not provided, defaults to all columns except the first two.
	 */
	cardContentKeys?: string[];
}

const DataView = <T extends { id: string }>({
	title,
	data,
	columns,
	actions = [],
	emptyMessage = 'No data found.',
	className = '',
	cardHeaderRenderer,
	cardContentKeys,
}: DataViewProps<T>) => {
	return (
		<Fragment>
			{title && <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>}

			{data.length === 0 ? (
				<div className="text-center py-8 text-gray-500">{emptyMessage}</div>
			) : (
				<>
					{/* Mobile/Tablet Cards View (< 800px) */}
					<div className="space-y-4 overflow-y-auto lg:hidden">
						{data.map((item) => (
							<DataViewCard
								key={item.id}
								item={item}
								columns={columns}
								actions={actions}
								cardHeaderRenderer={cardHeaderRenderer}
								cardContentKeys={cardContentKeys}
							/>
						))}
					</div>

					{/* Desktop Table View (≥ 800px) */}
					<div className="hidden lg:block">
						<DataViewTable
							data={data}
							columns={columns}
							actions={actions}
							className={className}
						/>
					</div>
				</>
			)}
		</Fragment>
	);
};

export default DataView;
