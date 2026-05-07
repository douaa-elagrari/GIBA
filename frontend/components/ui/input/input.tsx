import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  value,
  defaultValue,
  name,
  onChange,
  type = "text",
  readOnly = false,
  disabled = false,
  className = "",
  placeholder,
  leftIcon,
  rightIcon,
  error,
  helperText,
}: InputProps) {
  return (
    <div className="input-field-wrapper">
      {label && (
        <label className="input-field-label">
          {label}
        </label>
      )}
      <div className="input-field-inner">
        {leftIcon && (
          <span className="input-field-icon input-field-icon--left">
            {leftIcon}
          </span>
        )}
        <input
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "input-field",
            leftIcon && "input-field--has-left",
            rightIcon && "input-field--has-right",
            readOnly && "input-field--readonly",
            error && "input-field--error",
            className,
          )}
        />
        {rightIcon && (
          <span className="input-field-icon input-field-icon--right">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="input-field-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="input-field-hint">{helperText}</p>
      )}
    </div>
  );
}
