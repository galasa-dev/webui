/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import HomeContent from '@/components/HomeContent';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(), // Mock Headers
      redirected: false,
      type: "basic",
      url: "",
      text: jest.fn().mockResolvedValue('# Mocked Markdown Content This is a test'),
      json: jest.fn(), // Optional mock if needed for other tests
    } as unknown as Response)
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders markdown content', async () => {
  render(<HomeContent />);
  const content = await screen.findByText('Mocked Markdown Content This is a test');
  expect(content).toBeInTheDocument();
});

test("render home content title", async () => {

  render(<HomeContent />);

  await act(async () => {
    // Simulate the useEffect hook
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  const title = screen.getByText("Mocked Markdown Content This is a test");

  expect(title).toBeInTheDocument();
});

test("render home content sub-title", async () => {

  render(<HomeContent />);

  await act(async () => {
    // Simulate the useEffect the useEffect hook
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  const subTitle = screen.getByText("Mocked Markdown Content This is a test");

  expect(subTitle).toBeInTheDocument();
});
