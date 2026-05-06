import React from "react";
import { Outlet, Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Wallet, LayoutDashboard, LogOut, Menu, X, Coins, Tags, Receipt } from "lucide-react";
import { toast } from "sonner";

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success("Has cerrado sesión");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Cuentas", path: "/accounts", icon: Wallet },
    { name: "Transacciones", path: "/transactions", icon: Receipt },
    { name: "Categorías", path: "/categories", icon: Tags },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <Coins className="w-8 h-8 text-emerald-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">Mis Finanzas</span>
        </div>
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar for mobile */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 md:hidden">
          <div className="flex items-center">
            <Coins className="w-6 h-6 text-emerald-600 mr-2" />
            <span className="text-lg font-bold text-gray-900">Mis Finanzas</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
