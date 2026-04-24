import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterKey = 'developer' | 'status' | 'priority' | 'sp';

export interface FilterValues {
  developer?: string;
  status?: string;
  priority?: string;
  sp?: string;
}

export interface FeatureFiltersProps {
  developers: FilterOption[];
  statuses: FilterOption[];
  priorities: FilterOption[];
  storyPoints: FilterOption[];
  values?: FilterValues;
  onChange?: (key: FilterKey, value: string) => void;
}

/** Single dropdown — extracted to keep the row markup tidy. */
function Select({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value?: string;
  options: FilterOption[];
  onChange?: (v: string) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700
                 bg-white hover:border-gray-300 focus:outline-2 focus:outline-brand-dark"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Row of 4 dropdowns used to filter the features list.
 * Stateless / controlled — the parent owns the filter values and decides
 * what filtering means (the page does the actual .filter() pass).
 */
function FeatureFilters({
  developers,
  statuses,
  priorities,
  storyPoints,
  values,
  onChange,
}: FeatureFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Select
        placeholder="Todos los desarrolladores"
        value={values?.developer}
        options={developers}
        onChange={v => onChange?.('developer', v)}
      />
      <Select
        placeholder="Todos los estados"
        value={values?.status}
        options={statuses}
        onChange={v => onChange?.('status', v)}
      />
      <Select
        placeholder="Todas las prioridades"
        value={values?.priority}
        options={priorities}
        onChange={v => onChange?.('priority', v)}
      />
      <Select
        placeholder="Todos los SPs"
        value={values?.sp}
        options={storyPoints}
        onChange={v => onChange?.('sp', v)}
      />
    </div>
  );
}

export default React.memo(FeatureFilters);
