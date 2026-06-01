import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import { useContactSubmissions } from "../../hooks/useContactSubmissions";

function AdminDashboard() {
  const navigate = useNavigate();

  // Read the cached submissions count for the tab badge. The query runs
  // lazily, so this only triggers a fetch once MessagesTab mounts; if no
  // fetch has happened yet the count just renders as 0.
  const { data: messages = [] } = useContactSubmissions();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Top bar */}
      <div className="px-6 py-4 bg-white border-b border-[#E8E6E1] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-7 h-9 object-cover rounded-[50%] border border-[#E8E6E1]"
          />
          <span className="text-[#2C2C2A] text-sm font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors"
          >
            ← View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-6 bg-white border-b border-[#E8E6E1]">
        <div className="flex gap-1 max-w-[900px] mx-auto">
          <NavLink to="projects" className={tabClass}>
            Projects
          </NavLink>
          <NavLink to="analytics" className={tabClass}>
            Analytics
          </NavLink>
          <NavLink to="messages" className={tabClass}>
            Messages
            {messages.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#1D9E75] text-white text-[10px]">
                {messages.length}
              </span>
            )}
          </NavLink>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        <Outlet />
      </div>
    </div>
  );
}

function tabClass({ isActive }: { isActive: boolean }): string {
  const base = "px-4 py-3 text-sm border-b-2 transition-colors";
  return isActive
    ? `${base} border-[#1D9E75] text-[#0F6E56] font-medium`
    : `${base} border-transparent text-[#888780] hover:text-[#2C2C2A]`;
}

export default AdminDashboard;
