import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from '@/components/ui/Label';
import React from 'react';

describe('Label', () => {
  it('renders correctly with children', () => {
    render(<Label>Username</Label>);
    const label = screen.getByText('Username');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('text-sm font-medium');
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Username</Label>);
    expect(screen.getByText('Username')).toHaveClass('custom-label');
  });

  it('forwards ref to the label element', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Username</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('passes other props to the label element', () => {
    render(<Label htmlFor="input-id">Username</Label>);
    expect(screen.getByText('Username')).toHaveAttribute('for', 'input-id');
  });
});
