import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const MODAL_PARAM = 'action';
const STEP_PARAM = 'step';

/**
 * Drive modal open/close state from the URL query string.
 *
 * Usage:
 *   const { isOpen, open, close } = useModalFromURL('create');
 *
 * This gives you a bookmarkable, shareable URL like:
 *   /gen-ai-studio/api-keys?action=create
 *
 * For wizards with steps:
 *   const { isOpen, open, close, currentStep, setStep } = useModalFromURL('create');
 *   open('details');  // ?action=create&step=details
 *   setStep('review'); // ?action=create&step=review
 */
export function useModalFromURL(actionName: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.get(MODAL_PARAM) === actionName;
  const currentStep = searchParams.get(STEP_PARAM) ?? undefined;

  const open = useCallback(
    (step?: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(MODAL_PARAM, actionName);
        if (step) {
          next.set(STEP_PARAM, step);
        } else {
          next.delete(STEP_PARAM);
        }
        return next;
      });
    },
    [actionName, setSearchParams],
  );

  const close = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(MODAL_PARAM);
      next.delete(STEP_PARAM);
      return next;
    });
  }, [setSearchParams]);

  const setStep = useCallback(
    (step: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(STEP_PARAM, step);
        return next;
      });
    },
    [setSearchParams],
  );

  return { isOpen, open, close, currentStep, setStep } as const;
}
