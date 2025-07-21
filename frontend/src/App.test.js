import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main hero heading on HomePage', () => {
  render(<App />);
  const headingElement = screen.getByText(/Rent Premium Subscriptions/i);
  expect(headingElement).toBeInTheDocument();
});