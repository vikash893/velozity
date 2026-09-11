import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Search } from 'lucide-react';

interface TaskFiltersProps {
  onFilterChange?: () => void;
  showAssigneeFilter?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFilterChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const isOverdue = searchParams.get('isOverdue') || '';
  const search = searchParams.get('search') || '';
  const dueDateStart = searchParams.get('dueDateStart') || '';
  const dueDateEnd = searchParams.get('dueDateEnd') || '';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    if (onFilterChange) onFilterChange();
  };

  const resetFilters = () => {
    setSearchParams({});
    if (onFilterChange) onFilterChange();
  };

  const hasActiveFilters =
    status || priority || isOverdue || search || dueDateStart || dueDateEnd;

  return (
    <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-card space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or details..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="CRITICAL">Critical Priority</option>
        </select>

        {/* Overdue */}
        <select
          value={isOverdue}
          onChange={(e) => updateParam('isOverdue', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">All Deadlines</option>
          <option value="true">Overdue Only</option>
          <option value="false">On Schedule</option>
        </select>

        {/* Due Date Start */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>From:</span>
          <input
            type="date"
            value={dueDateStart}
            onChange={(e) => updateParam('dueDateStart', e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Due Date End */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>To:</span>
          <input
            type="date"
            value={dueDateEnd}
            onChange={(e) => updateParam('dueDateEnd', e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
