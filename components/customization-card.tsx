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
          <p className="text-xs font-semibold text-[#86868b]">Customize</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-[#1d1d1f]">{dishName}</h2>
          <p className="mt-1 text-xs text-[#6e6e73]">{customization.title}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-xl leading-none text-[#6e6e73]" aria-label="Close customization">
          ×
        </button>
      </div>

      {isSpiceCustomization ? (
        <div className="mt-5">
          {(() => {
            const selectedIndex = Math.max(0, customization.options.findIndex((option) => selectedIds.includes(option.id)));
            const selectedOption = customization.options[selectedIndex];
            const progress = customization.options.length > 1 ? (selectedIndex / (customization.options.length - 1)) * 100 : 100;
            return (
              <>
                <div className="relative mx-2 mt-5 h-5 rounded-full bg-[#e5e7eb]" style={{ background: 'linear-gradient(to right, #fde047 0%, #facc15 24%, #fb923c 52%, #f43f5e 76%, #b91c1c 100%)' }}>
                  <input
                    type="range"
                    min="0"
                    max={customization.options.length - 1}
                    value={selectedIndex}
                    onChange={(event) => toggleOption(customization.options[Number(event.target.value)])}
                    className="absolute inset-0 h-5 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-[#111827] [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#111827] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(15,23,42,0.28)] [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#111827] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(15,23,42,0.28)]"
                    aria-label="Spice level"
                  />
                </div>
                <p className="mt-3 text-center text-sm font-semibold text-[#1d1d1f]">{selectedOption?.label}</p>
              </>
            );
          })()}
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
