import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { Header } from '../Header';

describe('Header', () => {
  it('should render the header element', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should display the organization name', () => {
    render(<Header />);

    expect(screen.getAllByText('tuist').length).toBeGreaterThan(0);
  });

  it('should render documentation button', () => {
    render(<Header />);

    expect(screen.getByTitle('Documentation')).toBeInTheDocument();
  });

  it('should render user avatar with initial', () => {
    render(<Header />);

    // User avatar shows "A"
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should render organization avatar with initial', () => {
    render(<Header />);

    // Organization avatar shows "T"
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render breadcrumb buttons', () => {
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    // Should have multiple breadcrumb buttons + docs + avatar
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});
