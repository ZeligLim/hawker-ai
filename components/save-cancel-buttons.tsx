import { Check, LoaderCircle, X } from 'lucide-react';

type SaveCancelButtonsProps = {
  onSave?: () => void;
  onCancel: () => void;
  isSaving: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  type?: 'button' | 'submit';
  cancelBg?: 'white' | 'grey';
};

export function SaveCancelButtons({
  onSave,
  onCancel,
  isSaving,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  className = '',
  type = 'button',
  cancelBg = 'grey',
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
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-[#1d1d1f] transition-colors shrink-0 ${cancelBg === 'white' ? 'bg-white hover:bg-neutral-100 shadow-xs' : 'bg-[#f5f5f7] hover:bg-neutral-200'}`}
        aria-label={cancelLabel}
        title={cancelLabel}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
