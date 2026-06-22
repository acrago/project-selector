/**
 * Apollo Analytics - Zero-dependency analytics tracker.
 * 
 * Usage:
 *   1. Set window.APOLLO_ANALYTICS_ENDPOINT before loading this script
 *   2. Include this script in your HTML
 * 
 * Example:
 *   <script>window.APOLLO_ANALYTICS_ENDPOINT = "https://analytics.example.com";</script>
 *   <script src="/lib/tracker.js"></script>
 */
(function() {
  'use strict';

  // Configuration
  var endpoint = window.APOLLO_ANALYTICS_ENDPOINT || '';
  var VISITOR_ID_KEY = 'apollo_analytics_visitor_id';

  // Skip if no endpoint configured
  if (!endpoint) {
    console.log('[Apollo Analytics] No endpoint configured, skipping');
    return;
  }

  /**
   * Generate a UUID v4 for visitor identification.
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get or create a persistent visitor ID.
   */
  function getVisitorId() {
    try {
      var stored = localStorage.getItem(VISITOR_ID_KEY);
      if (stored) {
        return stored;
      }
      var newId = generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, newId);
      return newId;
    } catch {
      // localStorage not available, generate session-only ID
      return generateUUID();
    }
  }

  /**
   * Collect analytics data about the current page view.
   */
  function collectData() {
    return {
      visitor_id: getVisitorId(),
      page_url: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      screen_width: window.screen ? window.screen.width : null,
      screen_height: window.screen ? window.screen.height : null,
      user_agent: navigator.userAgent || '',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send analytics data to the server.
   */
  function sendData(data) {
    var url = endpoint.replace(/\/$/, '') + '/track';
    var payload = JSON.stringify(data);

    // Try sendBeacon first (doesn't block page unload)
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: 'application/json' });
      var sent = navigator.sendBeacon(url, blob);
      if (sent) {
        return;
      }
    }

    // Fallback to fetch
    if (window.fetch) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function() {
        // Silently fail - analytics should never break the app
      });
      return;
    }

    // Last resort: XMLHttpRequest
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    } catch {
      // Silently fail
    }
  }

  /**
   * Track the current page view.
   */
  function trackPageView() {
    var data = collectData();
    sendData(data);
  }

  // Track on page load
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // For SPAs: track on history changes
  var originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      // Small delay to let the page update
      setTimeout(trackPageView, 100);
    };
  }

  window.addEventListener('popstate', function() {
    setTimeout(trackPageView, 100);
  });

  // Expose for manual tracking if needed
  window.apolloAnalytics = {
    track: trackPageView,
    getVisitorId: getVisitorId
  };

  console.log('[Apollo Analytics] Tracker initialized, endpoint:', endpoint);
})();
