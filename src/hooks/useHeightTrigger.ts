import { useEffect } from 'react';
import { useIframeHeight } from './IframeHeightProvider';

/**
 * Hook to trigger height updates when certain values change
 * Use this in components where content height might change
 */
export const useHeightTrigger = (dependencies: any[]) => {
  const { forceHeightUpdate } = useIframeHeight();

  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(forceHeightUpdate, 100);
    return () => clearTimeout(timeoutId);
  }, dependencies);

  return forceHeightUpdate;
};

/**
 * Hook specifically for your booking flow
 * Triggers height updates on key state changes
 */
export const useBookingHeightTrigger = (
  showBookingForm: boolean,
  showPaymentForm: boolean,
  bookingComplete: boolean,
  hasSearched: boolean,
  availability: any[],
  error: string
) => {
  const { forceHeightUpdate } = useIframeHeight();

  useEffect(() => {
    // Trigger height update when booking flow state changes
    const timeoutId = setTimeout(forceHeightUpdate, 150);
    return () => clearTimeout(timeoutId);
  }, [showBookingForm, showPaymentForm, bookingComplete, hasSearched, forceHeightUpdate]);

  useEffect(() => {
    // Trigger height update when availability results change
    const timeoutId = setTimeout(forceHeightUpdate, 200);
    return () => clearTimeout(timeoutId);
  }, [availability.length, forceHeightUpdate]);

  useEffect(() => {
    // Trigger height update when error state changes
    if (error) {
      const timeoutId = setTimeout(forceHeightUpdate, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [error, forceHeightUpdate]);

  return forceHeightUpdate;
};
