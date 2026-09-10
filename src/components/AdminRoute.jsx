import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { dataLayer } from './dataLayer';
import { supabase } from './supabaseClient';

const AdminAccessContext = createContext(false);

// The project does not currently include a runtime prop-types dependency.

export default function AdminRoute({ children }) {
  const alreadyProtected = useContext(AdminAccessContext);

  if (alreadyProtected) {
    return children || <Outlet />;
  }

  return <AdminRouteCheck>{children}</AdminRouteCheck>;
}


function AdminRouteCheck({ children }) {
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
    const { data: sub } = supabase ? supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        window.setTimeout(checkAdmin, 0);
      }
    }) : { data: null };
    return () => { if (sub && typeof sub.subscription?.unsubscribe === 'function') sub.subscription.unsubscribe(); };
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden="true" />
        <span className="sr-only">Checking administrator access</span>
      </div>
    );
  }

  return isAdmin ? (
    <AdminAccessContext.Provider value={true}>
      {children || <Outlet />}
    </AdminAccessContext.Provider>
  ) : (
    <Navigate to="/AdminLogin" state={{ redirect: location.pathname }} replace />
  );
}
