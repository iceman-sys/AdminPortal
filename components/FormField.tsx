import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  icon?: ReactNode;
};

export function FormField({ label, hint, icon, className = "", id, ...inputProps }: Props) {
  const fieldId = id ?? inputProps.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="field" htmlFor={fieldId}>
      <span className="field__label">{label}</span>
      <div className={icon ? "field__control field__control--icon" : "field__control"}>
        {icon ? <span className="field__icon" aria-hidden>{icon}</span> : null}
        <input id={fieldId} className={`input ${className}`.trim()} {...inputProps} />
      </div>
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
