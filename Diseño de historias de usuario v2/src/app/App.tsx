import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountsProvider } from "./context/AccountsContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { TransactionsProvider } from "./context/TransactionsContext";
import { BudgetsProvider } from "./context/BudgetsContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <AccountsProvider>
        <CategoriesProvider>
          <BudgetsProvider>
            <TransactionsProvider>
              <RouterProvider router={router} />
              <Toaster position="top-right" />
            </TransactionsProvider>
          </BudgetsProvider>
        </CategoriesProvider>
      </AccountsProvider>
    </AuthProvider>
  );
}
