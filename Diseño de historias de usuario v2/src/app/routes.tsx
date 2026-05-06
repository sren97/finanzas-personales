import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Accounts } from "./pages/Accounts";
import { Categories } from "./pages/Categories";
import { Transactions } from "./pages/Transactions";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "accounts", Component: Accounts },
      { path: "categories", Component: Categories },
      { path: "transactions", Component: Transactions },
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
