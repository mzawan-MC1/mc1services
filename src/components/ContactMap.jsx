import { useQuery } from '@tanstack/react-query';
import { dataLayer } from './dataLayer';
import { MapPin } from 'lucide-react';

export default function ContactMap() {
  const { data: siteSettings = [] } = useQuery({
    queryKey: ['site-settings-map'],
    queryFn: () => dataLayer.siteSettings.getAll()
  });

  const mapUrl = siteSettings.find(s => s.setting_key === 'contact_map_url')?.setting_value || '';

  if (!mapUrl || mapUrl.trim() === '') {
    return (
      <div
        className="mt-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"
        style={{ minHeight: '300px', height: '300px' }}
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-500 font-medium">Map not configured</p>
          <p className="text-xs text-slate-400 mt-1">Add Google Maps Embed URL in Admin → Site Settings</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-8 rounded-xl overflow-hidden bg-slate-200"
      style={{ minHeight: '300px', height: '300px' }}
    >
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location Map"
      />
    </div>
  );
}
