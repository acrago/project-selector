import React from "react";
import ReactDOM from "react-dom/client";
import App from '@app/index';

// Suppress ResizeObserver loop errors - these are harmless and occur when
// ResizeObserver callbacks trigger layout changes that cause more resize observations
const resizeObserverLoopErrRe = /ResizeObserver loop/i;

// Suppress ResizeObserver errors in console.error (webpack dev server uses this)
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const firstArg = args[0];
  const errorStr = typeof firstArg === 'string' 
    ? firstArg 
    : firstArg?.message || firstArg?.toString() || '';
  
  if (resizeObserverLoopErrRe.test(errorStr)) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress in error event handler (catches uncaught errors)
window.addEventListener('error', (event) => {
  const errorMessage = event.message || event.error?.message || '';
  if (resizeObserverLoopErrRe.test(errorMessage)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true); // Use capture phase to catch before webpack dev server

// Suppress in unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  if (resizeObserverLoopErrRe.test(errorMessage)) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root") as Element);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
