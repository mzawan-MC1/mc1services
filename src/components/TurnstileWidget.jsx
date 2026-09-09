import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise;

const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    const script = existing || document.createElement('script');

    const handleLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile did not initialize.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile could not be loaded.')), { once: true });

    if (!existing) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
};

export default function TurnstileWidget({ siteKey, onVerify, resetKey = 0 }) {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;

    let disposed = false;
    let widgetId;

    loadTurnstile()
      .then((turnstile) => {
        if (disposed || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: 'contact_form',
          appearance: 'interaction-only',
          size: 'flexible',
          theme: 'auto',
          callback: (token) => onVerify(token),
          'expired-callback': () => onVerify(''),
          'error-callback': () => onVerify('')
        });
      })
      .catch(() => {
        if (!disposed) setLoadError('Security verification could not be loaded. Please refresh and try again.');
      });

    return () => {
      disposed = true;
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onVerify, resetKey]);

  if (!siteKey) {
    return <p role="alert" className="text-sm text-red-600">Security verification is not configured.</p>;
  }

  return (
    <div>
      <div ref={containerRef} className="min-h-[65px]" aria-label="Security verification" />
      {loadError && <p role="alert" className="mt-2 text-sm text-red-600">{loadError}</p>}
    </div>
  );
}

TurnstileWidget.propTypes = {
  siteKey: PropTypes.string,
  onVerify: PropTypes.func.isRequired,
  resetKey: PropTypes.number
};

