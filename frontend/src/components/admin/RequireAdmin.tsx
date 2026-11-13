import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../hooks/useSession";

// Route guard for /admin/*. Redirects to /admin/login when the server says
// there is no session, and stashes the attempted path on location state so
// the login flow can send the user back there on success.
//
// It has to ask the server: the session is an HttpOnly cookie, invisible to
// JavaScript, so there is nothing to look at locally. Until the answer comes
// back it renders nothing rather than flashing either the dashboard or the
// login page. The backend still checks every request; this only decides
// which screen to show.
function RequireAdmin() {
  const location = useLocation();
  const { data: admin, isPending, isError } = useSession();

  if (isPending) return null;

  if (isError) {
    return (
      <p className="p-6 text-sm text-muted">
        Couldn't reach the server to check your session. Try reloading.
      </p>
    );
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RequireAdmin;
