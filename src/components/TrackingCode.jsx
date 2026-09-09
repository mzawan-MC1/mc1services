import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from './dataLayer';

export default function TrackingCode() {
  const { data: siteSettings = [] } = useQuery({
    queryKey: ['site-settings-tracking'],
    queryFn: () => dataLayer.siteSettings.getAll()
  });

  useEffect(() => {
    // Ensure we have an array to work with
    const settingsArray = Array.isArray(siteSettings) ? siteSettings : [];
    const trackingCode = settingsArray.find(s => s.setting_key === 'head_tracking_code')?.setting_value;
    
    if (!trackingCode || trackingCode.trim() === '') return;

    // Check if already injected
    if (document.querySelector('[data-tracking-injected="true"]')) return;

    try {
      const div = document.createElement('div');
      div.setAttribute('data-tracking-injected', 'true');
      div.innerHTML = trackingCode;
      
      const elements = div.querySelectorAll('script, meta, link, style');
      elements.forEach(element => {
        const clone = element.cloneNode(true);
        clone.setAttribute('data-tracking-injected', 'true');
        document.head.appendChild(clone);
      });
    } catch (err) {
      console.error('Failed to inject tracking code:', err);
    }
  }, [siteSettings]);

  return null;
}