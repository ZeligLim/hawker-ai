import { Check, LoaderCircle, X } from 'lucide-react';

type SaveCancelButtonsProps = {
  onSave?: () => void;
  onCancel: () => void;
  isSaving: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  type?: 'button' | 'submit';
};

export function SaveCancelButtons({
  onSave,
  onCancel,
  isSaving,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  className = '',
  type = 'button',
}: SaveCancelButtonsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type={type}
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-white shadow-xs hover:bg-black disabled:opacity-70 transition-all shrink-0"
        aria-label={saveLabel}
        title={saveLabel}
      >
        {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200 transition-colors shrink-0"
        aria-label={cancelLabel}
        title={cancelLabel}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
