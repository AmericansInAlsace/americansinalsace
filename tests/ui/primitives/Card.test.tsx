import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import React from 'react';

describe('Card', () => {
  it('renders Card correctly', () => {
    render(<Card className="custom-card">Card Content</Card>);
    const card = screen.getByText('Card Content');
    expect(card).toHaveClass('rounded-lg border bg-white custom-card');
  });

  it('renders CardHeader correctly', () => {
    render(<CardHeader className="custom-header">Header Content</CardHeader>);
    const header = screen.getByText('Header Content');
    expect(header).toHaveClass('flex flex-col space-y-1.5 p-6 custom-header');
  });

  it('renders CardTitle correctly', () => {
    render(<CardTitle className="custom-title">Title Content</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Title Content');
    expect(title).toHaveClass('text-2xl font-semibold custom-title');
  });

  it('renders CardDescription correctly', () => {
    render(<CardDescription className="custom-desc">Description Content</CardDescription>);
    const desc = screen.getByText('Description Content');
    expect(desc).toHaveClass('text-sm text-gray-500 custom-desc');
  });

  it('renders CardContent correctly', () => {
    render(<CardContent className="custom-content">Main Content</CardContent>);
    const content = screen.getByText('Main Content');
    expect(content).toHaveClass('p-6 pt-0 custom-content');
  });

  it('renders CardFooter correctly', () => {
    render(<CardFooter className="custom-footer">Footer Content</CardFooter>);
    const footer = screen.getByText('Footer Content');
    expect(footer).toHaveClass('flex items-center p-6 pt-0 custom-footer');
  });

  it('forwards refs correctly', () => {
    const cardRef = React.createRef<HTMLDivElement>();
    const titleRef = React.createRef<HTMLHeadingElement>();

    render(
      <Card ref={cardRef}>
        <CardTitle ref={titleRef}>Title</CardTitle>
      </Card>
    );

    expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
    expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
  });
});
