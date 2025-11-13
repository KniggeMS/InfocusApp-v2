import React from 'react';
import { render } from '@testing-library/react-native';
import App from './index';

describe('App', () => {
  it('renders the placeholder content', () => {
    const { getByText } = render(<App />);

    expect(getByText('InFocus Mobile App')).toBeTruthy();
    expect(getByText('Placeholder for the InFocus mobile application')).toBeTruthy();
    expect(getByText(/Current date:/)).toBeTruthy();
  });
});
