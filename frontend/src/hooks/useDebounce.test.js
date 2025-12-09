import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 300 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 299ms (just before delay)
    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('initial');

    // Fast-forward remaining 1ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    act(() => vi.advanceTimersByTime(100));
    
    rerender({ value: 'change2' });
    act(() => vi.advanceTimersByTime(100));
    
    rerender({ value: 'change3' });
    act(() => vi.advanceTimersByTime(100));

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should have the last value
    expect(result.current).toBe('change3');
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle different value types', () => {
    // Number
    const { result: numResult, rerender: numRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    numRerender({ value: 42 });
    act(() => vi.advanceTimersByTime(300));
    expect(numResult.current).toBe(42);

    // Object
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { a: 1 } } }
    );

    const newObj = { a: 2 };
    objRerender({ value: newObj });
    act(() => vi.advanceTimersByTime(300));
    expect(objResult.current).toBe(newObj);

    // Array
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: [1, 2] } }
    );

    const newArr = [3, 4];
    arrRerender({ value: newArr });
    act(() => vi.advanceTimersByTime(300));
    expect(arrResult.current).toBe(newArr);
  });
});

