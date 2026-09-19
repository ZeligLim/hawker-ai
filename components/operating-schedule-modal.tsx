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
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl  overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 ">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1d1d1f]">{title}</h2>
              {description ? <p className="text-xs text-[#6e6e73]">{description}</p> : null}
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#86868b]">
                  Daily operating hours
                </h3>
                <button
                  type="button"
                  onClick={() => handleApplyToAll('mon')}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 shadow-xs"
                >
                  <Copy className="w-3 h-3" />
                  Apply Monday to all
                </button>
              </div>

              <div className="rounded-2xl bg-[#f5f5f7] overflow-hidden p-1 flex flex-col gap-1">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = weekly[key] || { isOpen: true, open: '08:00', close: '22:00' };
                  const isOvernight = day.isOpen && day.open > day.close;

                  return (
                    <div
                      key={key}
                      className={`rounded-xl p-3 transition-colors ${day.isOpen ? 'bg-white shadow-sm' : 'bg-transparent'}`}
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
                                className="px-2 py-1 text-xs rounded-lg  bg-white text-[#1d1d1f] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-[#86868b]">to</span>
                              <input
                                type="time"
                                value={day.close}
                                onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                                className="px-2 py-1 text-xs rounded-lg  bg-white text-[#1d1d1f] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-white sticky bottom-0">
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
    </div>
  );
}
