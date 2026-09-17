'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X, Check, AlertCircle, Copy } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1d1d1f]">{title}</h2>
              <p className="text-xs text-[#6e6e73]">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Master Schedule Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7] border border-black/5">
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">
                  Automated Operating Hours
                </p>
                <p className="text-xs text-[#6e6e73]">
                  {enabled
                    ? 'Status switches automatically based on configured hours.'
                    : 'Disabled. Manual status toggle is in full effect.'}
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                  Daily Operating Hours
                </h3>
                <button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  Apply Monday to All Days
                </button>
              </div>

              <div className="divide-y divide-black/5 rounded-xl border border-black/5 bg-[#fafafa] overflow-hidden">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = weekly[key] || { isOpen: true, open: '08:00', close: '22:00' };
                  const isOvernight = day.isOpen && day.open > day.close;

                  return (
                    <div
                      key={key}
                      className={`p-3 transition-colors ${
                        day.isOpen ? 'bg-white' : 'bg-[#f5f5f7]/60'
                      }`}
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
                                className="px-2 py-1 text-xs rounded-lg border border-black/10 bg-white text-[#1d1d1f] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-[#86868b]">to</span>
                              <input
                                type="time"
                                value={day.close}
                                onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                                className="px-2 py-1 text-xs rounded-lg border border-black/10 bg-white text-[#1d1d1f] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#f5f5f7] border-t border-black/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
