'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from './button';
import { Settings2, GripVertical, Check, Eye, EyeOff } from 'lucide-react';

// --- Types ---

export interface Column<T> {
    id: string;
    label: string;
    accessor?: keyof T; // Simple key accessor
    render?: (row: T) => React.ReactNode; // Custom render function
    className?: string; // Optional ClassName for specific styling
}

interface DynamicTableProps<T> {
    id: string; // Unique ID for localstorage persistence
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    title?: string; // Optional title for the customization menu
}

interface ColumnConfig {
    id: string;
    isVisible: boolean;
}

// --- Sortable Header Item Component ---

function SortableHeader({
    column,
    id
}: {
    column: Column<any>;
    id: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'move'
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b select-none group hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                {column.label}
            </div>
        </th>
    );
}

// --- Main Component ---

export default function DynamicTable<T extends { id: string | number }>({
    id,
    data,
    columns,
    onRowClick,
    isLoading = false,
    emptyMessage = "No data found.",
    title = "Data Table"
}: DynamicTableProps<T>) {

    // --- State ---

    // Order of columns (array of column IDs)
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    // Visibility state (map of column ID -> boolean)
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // --- Initialization & Persistence ---

    useEffect(() => {
        setIsClient(true);
        // Load preference from local storage
        const savedConfig = localStorage.getItem(`table_config_${id}`);
        const defaultOrder = columns.map(c => c.id);
        const defaultVisibility = columns.reduce((acc, c) => ({ ...acc, [c.id]: true }), {});

        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                // Validate if saved config matches current columns (simple check)
                const savedOrder = parsed.order || [];
                const savedVis = parsed.visibility || {};

                // Ensure all current columns are present in saved order (handle new columns)
                const mergedOrder = [...savedOrder, ...defaultOrder.filter(cid => !savedOrder.includes(cid))];

                // Filter out stale columns from saved order
                const finalOrder = mergedOrder.filter(cid => defaultOrder.includes(cid));

                setColumnOrder(finalOrder.length > 0 ? finalOrder : defaultOrder);
                setColumnVisibility({ ...defaultVisibility, ...savedVis });
            } catch (e) {
                console.error("Failed to parse table config", e);
                setColumnOrder(defaultOrder);
                setColumnVisibility(defaultVisibility);
            }
        } else {
            setColumnOrder(defaultOrder);
            setColumnVisibility(defaultVisibility);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only re-run if ID changes. Columns are assumed stable or we ignore changes to them for config loading.

    const saveConfig = (newOrder: string[], newVisibility: Record<string, boolean>) => {
        localStorage.setItem(`table_config_${id}`, JSON.stringify({
            order: newOrder,
            visibility: newVisibility
        }));
    };

    // --- Drag & Drop Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over?.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save immediately
                saveConfig(newOrder, columnVisibility);
                return newOrder;
            });
        }
    };

    // --- Toggles ---
    const toggleVisibility = (colId: string) => {
        const newVis = { ...columnVisibility, [colId]: !columnVisibility[colId] };
        setColumnVisibility(newVis);
        saveConfig(columnOrder, newVis);
    };

    // --- Computed ---

    // Sort columns based on order state
    const visibleColumnIds = columnOrder.filter(cid => columnVisibility[cid]);
    const visibleColumns = visibleColumnIds
        .map(cid => columns.find(c => c.id === cid))
        .filter(Boolean) as Column<T>[];

    // For the customization menu (all columns in order)
    const orderedAllColumns = columnOrder
        .map(cid => columns.find(c => c.id === cid))
        .filter(Boolean) as Column<T>[];


    if (!isClient) return <div className="p-8 text-center">Loading table...</div>;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-end relative">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-gray-700 border-gray-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Settings2 size={16} />
                    Customize Columns
                </Button>

                {/* Customization Menu Dropdown */}
                {isMenuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b">
                            <h3 className="font-semibold text-sm text-gray-900">Table Settings</h3>
                            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">Close</button>
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                            Drag to reorder. Toggle eye to show/hide.
                        </div>

                        {/* Reorderable List in Menu */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={columnOrder}
                                strategy={horizontalListSortingStrategy} // Actually vertical list here, but using simple id array
                            >
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {orderedAllColumns.map((col) => (
                                        <MenuDragItem
                                            key={col.id}
                                            id={col.id}
                                            label={col.label}
                                            isVisible={!!columnVisibility[col.id]}
                                            onToggle={() => toggleVisibility(col.id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {visibleColumns.map((col) => (
                                    <th
                                        key={col.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-12 text-center text-gray-500">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-12 text-center text-gray-500">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick && onRowClick(row)}
                                    >
                                        {visibleColumns.map((col) => (
                                            <td key={col.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.className || ''}`}>
                                                {col.render ? col.render(row) : (row[col.accessor || 'id'] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Menu Drag Item Component ---
function MenuDragItem({ id, label, isVisible, onToggle }: { id: string, label: string, isVisible: boolean, onToggle: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 group hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
                <div {...attributes} {...listeners} className="cursor-move p-1 text-gray-400 hover:text-gray-600">
                    <GripVertical size={14} />
                </div>
                <span className="text-sm text-gray-700 truncate">{label}</span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`p-1 rounded transition-colors ${isVisible ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
                title={isVisible ? "Hide Column" : "Show Column"}
            >
                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
        </div>
    );
}
