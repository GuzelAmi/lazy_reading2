// src/test/wrapper.tsx
import React, { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

interface WrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

export const TestWrapper = ({ children, initialEntries = ['/'] }: WrapperProps) => (
  <HelmetProvider>
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  </HelmetProvider>
);