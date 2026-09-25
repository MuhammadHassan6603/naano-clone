import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useId } from 'react'

export const inputClass =
  'block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none aria-[invalid=true]:border-danger'

type FieldShellProps = {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
  aside?: ReactNode
}

export function FieldShell({ id, label, hint, error, children, aside }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  trailing?: ReactNode
}

export function TextField({ label, hint, error, aside, trailing, className = '', ...props }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} aside={aside}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${inputClass} ${trailing ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
    </FieldShell>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: ReactNode
  error?: string
  aside?: ReactNode
}

export function TextArea({ label, hint, error, aside, className = '', ...props }: TextAreaProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} aside={aside}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} min-h-32 resize-y leading-6 ${className}`}
        {...props}
      />
    </FieldShell>
  )
}
