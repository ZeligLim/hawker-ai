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
  // Determine default spice selection if it exists
  const defaultSpiceId = customization.spiceOptions?.[0]?.id;

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelection ?? [
      ...(defaultSpiceId ? [defaultSpiceId] : []),
      // If there are options and it's not multi-select (unlikely, but just in case), select first
      ...(!customization.multiSelect && customization.options?.length && !defaultSpiceId
        ? [customization.options[0].id]
        : []),
    ]
  );

  const allAvailableOptions = useMemo(
    () => [...(customization.options || []), ...(customization.spiceOptions || [])],
    [customization.options, customization.spiceOptions]
  );

  const selectedOptions = useMemo(
    () => allAvailableOptions.filter((option) => selectedIds.includes(option.id)),
    [allAvailableOptions, selectedIds]
  );

  const extraPrice = selectedOptions.reduce((sum, option) => sum + option.price, 0);

  const toggleOption = (option: CustomizationOption, isSpice: boolean) => {
    setSelectedIds((current) => {
      if (isSpice) {
        // Replace the existing spice selection
        const withoutSpice = current.filter((id) => !id.startsWith('spice-'));
        return [...withoutSpice, option.id];
      }

      if (customization.multiSelect) {
        return current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id];
      }
      
      // If single select for regular options
      const withoutRegular = current.filter((id) => id.startsWith('spice-'));
      return [...withoutRegular, option.id];
    });
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-[398px] rounded-[26px] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] max-h-[75vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#86868b]">Customize</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-[#1d1d1f]">{dishName}</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-full text-base text-[#6e6e73] hover:bg-neutral-100 hover:text-black transition-colors"
          aria-label="Close customization"
        >
          ×
        </button>
      </div>

      {customization.spiceOptions && customization.spiceOptions.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-[#6e6e73]">Choose your spice level</p>
          {(() => {
            const selectedIndex = Math.max(
              0,
              customization.spiceOptions.findIndex((option) => selectedIds.includes(option.id))
            );
            const selectedOption = customization.spiceOptions[selectedIndex];

            return (
              <>
                {/* Drag Slider (Requested by user) */}
                <div
                  className="relative mx-1 mt-4 h-5 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to right, #34d399 0%, #facc15 33%, #fb923c 66%, #ef4444 100%)',
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max={customization.spiceOptions.length - 1}
                    value={selectedIndex}
                    onChange={(event) =>
                      toggleOption(customization.spiceOptions![Number(event.target.value)], true)
                    }
                    className="absolute inset-0 h-5 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-black [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    aria-label="Spice level slider"
                  />
                </div>

                <p className="mt-3 text-center text-sm font-bold text-black">
                  {selectedOption?.label}
                </p>
              </>
            );
          })()}
        </div>
      )}

      {customization.options && customization.options.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-[#6e6e73]">
            {customization.title || 'Add extras'}
          </p>
          <div className="space-y-2">
            {customization.options.map((option) => {
              const selected = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option, false)}
                  className={`flex h-11 w-full items-center justify-between rounded-xl px-4 text-left text-xs font-semibold transition-colors ${
                    selected ? 'bg-black text-white shadow-xs' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className={selected ? 'text-white/80' : 'text-[#6e6e73]'}>
                    {option.price > 0 ? `+ RM ${option.price.toFixed(2)}` : 'Included'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm Button: Standard Apple 44px h-11, Pure Black, 0 Border, No Animation */}
      <button
        type="button"
        onClick={() => onConfirm({ options: selectedOptions, price: basePrice + extraPrice })}
        disabled={selectedOptions.length === 0 && (!customization.multiSelect && customization.options?.length ? true : false)}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-black hover:bg-neutral-800 px-5 text-sm font-semibold text-white disabled:opacity-40 transition-colors shadow-xs"
      >
        Add to order · RM {(basePrice + extraPrice).toFixed(2)}
      </button>
    </div>
  );
}
