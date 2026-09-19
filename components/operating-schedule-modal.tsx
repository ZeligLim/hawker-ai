'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X, Check, AlertCircle, Copy, ChevronLeft, ArrowLeft } from 'lucide-react';
import {
  DAYS_OF_WEEK,
  DEFAULT_WEEKLY_SCHEDULE,
  type DayOfWeek,
  type OperatingSchedule,
  type WeeklySchedule,
} from '@/lib/schedule/operating-hours';

interface OperatingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialSchedule?: OperatingSchedule | null;
  onSave: (schedule: OperatingSchedule) => Promise<void>;
}

export function OperatingScheduleModal(props: OperatingScheduleModalProps) {
  if (!props.isOpen) return null;
  return <OperatingScheduleDialogContent {...props} />;
}

function OperatingScheduleDialogContent({
  onClose,
  title,
  description,
  initialSchedule,
  onSave,
}: OperatingScheduleModalProps) {
  const [enabled, setEnabled] = useState<boolean>(() => Boolean(initialSchedule?.enabled));
  const [weekly, setWeekly] = useState<WeeklySchedule>(() => ({
    ...DEFAULT_WEEKLY_SCHEDULE,
    ...(initialSchedule?.weekly || {}),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleDay = (day: DayOfWeek) => {
    setWeekly((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleTimeChange = (day: DayOfWeek, field: 'open' | 'close', value: string) => {
    setWeekly((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleApplyToAll = (sourceDay: DayOfWeek) => {
    const source = weekly[sourceDay];
    setWeekly((prev) => {
      const next = { ...prev };
      DAYS_OF_WEEK.forEach(({ key }) => {
        next[key] = {
          isOpen: source.isOpen,
          open: source.open,
          close: source.close,
        };
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const schedule: OperatingSchedule = {
        enabled,
        weekly,
        timezone: 'Asia/Kuala_Lumpur',
      };
      await onSave(schedule);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f7] animate-in slide-in-from-bottom-4 duration-200" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="flex shrink-0 items-center border-b border-black/[0.04] bg-[#f5f5f7] px-4 py-3 sm:px-6 gap-3">
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-xs hover:bg-black/5 transition-colors -ml-1 shrink-0" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            {title}
          </h2>
          {description && <p className="text-xs text-[#86868b]">{description}</p>}
        </div>
      </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 shadow-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Master Schedule Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7] ">
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">
                  Automated Operating Hours
                </p>
                <p className="text-xs text-[#6e6e73]">
                  {enabled ? 'Status switches automatically based on configured hours.' : ''}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Weekly Schedule Settings */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <h3 className="text-xs font-semibold text-[#86868b]">
                  Daily operating hours
                </h3>
                <button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex h-11 sm:h-8 w-full sm:w-auto items-center justify-center gap-1.5 rounded-full bg-black px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 shadow-xs">
                  <Copy className="w-3 h-3" />
                  Apply Monday to all
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = weekly[key] || { isOpen: true, open: '08:00', close: '22:00' };
                  const isOvernight = day.isOpen && day.open > day.close;

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl p-4 transition-colors shadow-xs ${day.isOpen ? 'bg-white' : 'bg-white/50'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-[120px]">
                          <input
                            type="checkbox"
                            id={`day-${key}`}
                            checked={day.isOpen}
                            onChange={() => handleToggleDay(key)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <label
                            htmlFor={`day-${key}`}
                            className={`text-xs font-semibold cursor-pointer select-none ${
                              day.isOpen ? 'text-[#1d1d1f]' : 'text-[#86868b] line-through'
                            }`}
                          >
                            {label}
                          </label>
                        </div>

                        {day.isOpen ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={day.open}
                                onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                                className="px-3 py-2 text-xs rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f] font-mono font-medium outline-none focus:bg-[#e5e5ea] transition-colors"
                              />
                              <span className="text-xs text-[#86868b]">to</span>
                              <input
                                type="time"
                                value={day.close}
                                onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                                className="px-3 py-2 text-xs rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f] font-mono font-medium outline-none focus:bg-[#e5e5ea] transition-colors"
                              />
                            </div>
                            {isOvernight && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium shrink-0">
                                Next day
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#86868b] italic">Closed all day</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#f5f5f7] border-t border-black/[0.04] sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white bg-black hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
    </div>
  );
}
