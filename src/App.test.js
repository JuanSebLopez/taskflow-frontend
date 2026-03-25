import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

test('renders the auth screen by default', () => {
  render(<App />);
  expect(screen.getByText(/taskflow frontend/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});
