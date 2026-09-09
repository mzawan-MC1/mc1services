import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dataLayer } from './dataLayer';

let sessionId = null;

const getSessionId = () => {
  if (sessionId) return sessionId;
  sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await dataLayer.analytics.create({
          event_type: 'page_view',
          page_path: location.pathname,
          page_title: document.title,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          session_id: getSessionId()
        });
      } catch (_err) {
        // Silent fail
      }
    };

    trackPageView();
  }, [location]);

  return null;
}