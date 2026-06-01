import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../api/auth";

// Route guard for /admin/*. Redirects to /admin/login if no token is
// present and stashes the attempted path on location state so the login
// flow can send the user back there on success.
//
// A stale or forged token still lets the user past this guard — the real
// check happens server-side. The api client's 401 interceptor clears the
// token if the backend rejects a request, so the cost of a bad token is
// at most one redirect.
function RequireAdmin() {
  const location = useLocation();

  if (!isAuthenticated()) {
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
