import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Accounts } from "./pages/Accounts";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "accounts", Component: Accounts },
    ],
  },
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
    ],
  },
]);
