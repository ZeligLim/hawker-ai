'use client';

import { useMemo, useState } from 'react';
import type { CustomizationOption, DishCustomization } from '@/lib/order/customizations';

function ChiliIcon({ active, level }: { active: boolean; level: number }) {
  const color = !active ? '#d1d5db' : level <= 2 ? '#eab308' : level <= 3 ? '#f97316' : '#dc2626';

  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path d="M11.8 7.2c3.2-1.9 6.6-1.3 7.5 1.2 1 2.7-1.3 6.8-4.7 8.9-3.8 2.4-8.3 2-10.1-.8-1.5-2.4.1-5.3 3-6.8 1.3-.7 2.8-1.5 4.3-2.5Z" fill={color} />
      <path d="M12.1 7.4c-.5-2.2.6-4.1 2.8-4.9M14.5 3.8c1.1-.5 2.2-.3 2.8.4" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CustomizationCard({
  dishName,
  basePrice,
  customization,
  initialSelection,
  onCancel,
  onConfirm,
}: {
  dishName: string;
  basePrice: number;
  customization: DishCustomization;
  initialSelection?: string[];
  onCancel: () => void;
  onConfirm: (selection: { options: CustomizationOption[]; price: number }) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelection ?? (customization.multiSelect ? [] : [customization.options[0]?.id]),
  );
  const selectedOptions = useMemo(
    () => customization.options.filter((option) => selectedIds.includes(option.id)),
    [customization.options, selectedIds],
  );
  const extraPrice = selectedOptions.reduce((sum, option) => sum + option.price, 0);
  const isSpiceCustomization = customization.title.toLowerCase().includes('spice');

  const toggleOption = (option: CustomizationOption) => {
    setSelectedIds((current) => {
      if (customization.multiSelect) {
        return current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id];
      }
      return [option.id];
    });
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-[398px] rounded-[26px] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Customize</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-[#1d1d1f]">{dishName}</h2>
          <p className="mt-1 text-xs text-[#6e6e73]">{customization.title}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-xl leading-none text-[#6e6e73]" aria-label="Close customization">
          ×
        </button>
      </div>

      {isSpiceCustomization ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            {customization.options.map((option, index) => {
              const selected = selectedIds.includes(option.id);
              return (
                <button key={option.id} type="button" onClick={() => toggleOption(option)} className="flex flex-1 flex-col items-center gap-1" aria-label={option.label}>
                  <ChiliIcon active={selected} level={index + 1} />
                  <span className={`text-[10px] font-medium ${selected ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>{index + 1}</span>
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min="1"
            max={customization.options.length}
            value={Math.max(1, customization.options.findIndex((option) => selectedIds.includes(option.id)) + 1)}
            onChange={(event) => toggleOption(customization.options[Number(event.target.value) - 1])}
            className="mt-3 w-full accent-[#f97316]"
            aria-label="Spice level"
          />
          <p className="mt-2 text-center text-xs font-medium text-[#6e6e73]">
            {customization.options.find((option) => selectedIds.includes(option.id))?.label}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {customization.options.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option)}
                className={`flex w-full items-center justify-between rounded-[16px] px-3 py-3 text-left text-sm ${
                  selected ? 'bg-[#111827] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'
                }`}
              >
                <span>{option.label}</span>
                <span className={selected ? 'text-white/75' : 'text-[#6e6e73]'}>
                  {option.price > 0 ? `+ RM ${option.price.toFixed(2)}` : 'Included'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onConfirm({ options: selectedOptions, price: basePrice + extraPrice })}
        disabled={!customization.multiSelect && selectedOptions.length === 0}
        className="mt-4 w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Add to order · RM {(basePrice + extraPrice).toFixed(2)}
      </button>
    </div>
  );
}
