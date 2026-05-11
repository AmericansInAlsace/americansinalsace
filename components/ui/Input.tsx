import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * A styled input component that includes built-in support for displaying an error message.
 * It forwards refs to the underlying HTML input element.
 *
 * @param {React.ForwardedRef<HTMLInputElement>} ref - A ref to the underlying input element.
 * @param {InputProps} props - The props for the component.
 * @param {string} [props.className] - Additional CSS classes to apply to the input.
 * @param {string} [props.error] - If provided, displays an error message below the input and applies error styling.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
