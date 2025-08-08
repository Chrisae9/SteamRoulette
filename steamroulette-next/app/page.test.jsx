import { render, screen } from '@testing-library/react';
import HomePage from './page';

test('renders sign in button', () => {
  render(<HomePage />);
  expect(screen.getByText(/Sign in with Steam/i)).toBeInTheDocument();
});