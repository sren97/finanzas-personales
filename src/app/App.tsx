import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountsProvider } from "./context/AccountsContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <AccountsProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AccountsProvider>
    </AuthProvider>
  );
}
