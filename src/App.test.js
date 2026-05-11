import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

test('renders the auth screen by default', async () => {
  render(<App />);
  expect(await screen.findByText(/acceso seguro/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});
