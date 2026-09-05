'use client';

import { useMemo, useState } from 'react';
import type { CustomizationOption, DishCustomization } from '@/lib/order/customizations';

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
