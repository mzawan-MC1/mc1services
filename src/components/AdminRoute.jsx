import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { dataLayer } from './dataLayer';
import { supabase } from './supabaseClient';

// The project does not currently include a runtime prop-types dependency.
// eslint-disable-next-line react/prop-types
export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await dataLayer.auth.isAdmin();
        setIsAdmin(adminStatus);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
    const { data: sub } = supabase ? supabase.auth.onAuthStateChange(() => {
      setIsAdmin(null);
      checkAdmin();
    }) : { data: null };
    return () => { if (sub && typeof sub.subscription?.unsubscribe === 'function') sub.subscription.unsubscribe(); };
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return isAdmin ? (
    children ? children : <Outlet />
  ) : (
    <Navigate to="/AdminLogin" state={{ redirect: location.pathname }} replace />
  );
}
