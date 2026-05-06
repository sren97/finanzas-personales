import React from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Coins } from "lucide-react";

export function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 flex flex-col items-center">
        <Coins className="w-12 h-12 text-emerald-600 mb-2" />
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Mis Finanzas
        </h2>
      </div>
      <Outlet />
    </div>
  );
}
