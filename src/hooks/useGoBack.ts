import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Reliable back navigation hook for SPA.
 * Uses React Router's internal history index to determine if there's
 * a previous page within the app. Falls back to a provided route or "/".
 */
export const useGoBack = (fallback: string = "/") => {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    // React Router stores an index in history state
    const historyIdx = (window.history.state as any)?.idx;
    if (typeof historyIdx === "number" && historyIdx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);

  return goBack;
};
