import { render, screen, fireEvent } from '@testing-library/react';
import { EmailEditor } from '@/components/features/backoffice/EmailEditor';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock dynamic import
vi.mock('next/dynamic', () => ({
  default: (fn: any, options: any) => {
    return function MockedComponent(props: any) {
      if (props.__test_loading && options.loading) {
        const LoadingComponent = options.loading;
        return <LoadingComponent />;
      }
      return <div data-testid="mock-quill"><textarea value={props.value} onChange={(e) => props.onChange(e.target.value)} /></div>;
    };
  },
}));

describe('EmailEditor', () => {
  it('should render the editor container', () => {
    render(<EmailEditor value="<p>Test</p>" onChange={() => {}} __test_loading={false} />);
    expect(screen.getByTestId('mock-quill')).toBeInTheDocument();
  });

  it('should call onChange when content changes', () => {
    const onChange = vi.fn();
    render(<EmailEditor value="" onChange={onChange} __test_loading={false} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    expect(onChange).toHaveBeenCalledWith('New content');
  });

  it('should render loading state', () => {
    render(<EmailEditor value="" onChange={() => {}} __test_loading={true} />);
    expect(screen.getByTestId('quill-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-quill')).not.toBeInTheDocument();
  });

  it('should render available placeholders', () => {
    const placeholders = ['userName', 'actionUrl'];
    render(<EmailEditor value="" onChange={() => {}} availablePlaceholders={placeholders} __test_loading={false} />);
    
    expect(screen.getByText('{{userName}}')).toBeInTheDocument();
    expect(screen.getByText('{{actionUrl}}')).toBeInTheDocument();
  });
});
