/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { HOME } from '@/utils/constants/breadcrumb'; 
import { BreadCrumbProps } from '@/utils/interfaces'; 

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    setItem(key: string, value: string) {
      store[key] = value;
    },
    getItem(key: string) {
      return store[key] || null;
    }, 
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock next/navigation
const usePathnameMock = jest.fn();
const useSearchParamsMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

const PAGE_1: BreadCrumbProps = { title: 'Page 1', route: '/page-1' };
const PAGE_2: BreadCrumbProps = { title: 'Page 2', route: '/page-2' };
const PAGE_2_WITH_QUERY: BreadCrumbProps = { title: 'Page 2 with Query', route: '/page-2?id=123' };

describe('useHistoryBreadCrumbs', () => {
  // Reset mocks and sessionStorage before each test
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.clear();
    usePathnameMock.mockReturnValue('/');
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  test('should initialize from sessionStorage and then truncate based on path', async () => {
    const storedItems = [HOME, PAGE_1, PAGE_2];
    sessionStorage.setItem('breadCrumbHistory', JSON.stringify(storedItems));
    usePathnameMock.mockReturnValue('/page-1');

    const {result} = renderHook(() => useHistoryBreadCrumbs());
    
    await waitFor(() => {
      expect(result.current.breadCrumbItems).toEqual([HOME]);
    });
  });

  test('should initialize with HOME but then truncate to empty array based on path', async () => {
    const {result} = renderHook(() => useHistoryBreadCrumbs());

    await waitFor(() => {
      expect(result.current.breadCrumbItems).toEqual([]);
    });
  });

  test('should push new breadcrumb item', async () => {
    const {result} = renderHook(() =>  useHistoryBreadCrumbs());
    
    // Wait for initial truncation to an empty array.
    await waitFor(() => {
        expect(result.current.breadCrumbItems).toEqual([]);
    });

    act(() => {
      result.current.pushBreadCrumb(HOME);
      result.current.pushBreadCrumb(PAGE_1);
    });

    expect(result.current.breadCrumbItems).toEqual([HOME, PAGE_1]);
    expect(sessionStorageMock.getItem('breadCrumbHistory')).toEqual(JSON.stringify([HOME, PAGE_1]));
  });

  test('should not push duplicate breadcrumb item', async () => {
    const {result} = renderHook(() => useHistoryBreadCrumbs());
    
    await waitFor(() => {
        expect(result.current.breadCrumbItems).toEqual([]);
    });

    act(() => {
      result.current.pushBreadCrumb(HOME);
      result.current.pushBreadCrumb(PAGE_1);
      result.current.pushBreadCrumb(PAGE_1); 
    });

    expect(result.current.breadCrumbItems).toEqual([HOME, PAGE_1]);
  });
  
  test('should reset breadcrumbs to HOME', async () => {
    const {result} = renderHook(() => useHistoryBreadCrumbs());

    // Setup the state first
    act(() => {
      result.current.pushBreadCrumb(HOME);
      result.current.pushBreadCrumb(PAGE_1);
    });
    expect(result.current.breadCrumbItems).toEqual([HOME, PAGE_1]);


    act(() => {
      result.current.resetBreadCrumbs();
    });

    await waitFor(() => {
        expect(result.current.breadCrumbItems).toEqual([HOME]);
    });
    expect(sessionStorageMock.getItem('breadCrumbHistory')).toEqual(JSON.stringify([HOME]));
  });
  
  test('should handle browser navigation and truncate breadcrumbs', async () => {
    sessionStorage.setItem('breadCrumbHistory', JSON.stringify([HOME, PAGE_1, PAGE_2]));

    usePathnameMock.mockReturnValue('/page-1');
    const { result } = renderHook(() => useHistoryBreadCrumbs());
    
    await waitFor(() => {
      expect(result.current.breadCrumbItems).toEqual([HOME]);
    });
  });

  test('should correctly handle paths with query parameters', async () => {
    sessionStorage.setItem('breadCrumbHistory', JSON.stringify([HOME, PAGE_1, PAGE_2_WITH_QUERY]));
    
    // "Navigate" back to page 1
    usePathnameMock.mockReturnValue('/page-1');
    useSearchParamsMock.mockReturnValue(new URLSearchParams()); 
    
    const { result } = renderHook(() => useHistoryBreadCrumbs());

    await waitFor(() => {
      expect(result.current.breadCrumbItems).toEqual([HOME]);
    });
  });
});