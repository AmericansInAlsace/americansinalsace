import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * A styled label component that is associated with a form input.
 * It forwards refs to the underlying HTML label element.
 *
 * @param {React.ForwardedRef<HTMLLabelElement>} ref - A ref to the underlying label element.
 * @param {LabelProps} props - The props for the component.
 * @param {string} [props.className] - Additional CSS classes to apply.
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
