import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * A versatile button component that supports different visual styles, sizes, and a loading state.
 * It is built on top of the standard HTML button element and forwards refs to it.
 *
 * @param {React.ForwardedRef<HTMLButtonElement>} ref - A ref to the underlying button element.
 * @param {ButtonProps} props - The props for the component.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {'primary' | 'secondary' | 'outline' | 'ghost'} [props.variant='primary'] - The visual style of the button.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the button.
 * @param {boolean} [props.isLoading] - If true, shows a loading spinner and disables the button.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-[var(--color-primary-red)] text-white hover:opacity-90 active:opacity-100 shadow-sm',
      secondary: 'bg-[var(--color-primary-blue)] text-white hover:opacity-90 active:opacity-100 shadow-sm',
      outline: 'border border-[var(--color-gray-200)] bg-transparent hover:bg-[var(--color-gray-50)] text-[var(--color-gray-900)]',
      ghost: 'bg-transparent hover:bg-[var(--color-gray-100)] text-[var(--color-gray-900)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        className={combinedClassName}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
