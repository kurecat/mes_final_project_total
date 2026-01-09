// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import GlobalStyle from "./style/GlobalStyle";

// 페이지 Import
import AdminMainPage from "./pages/admin/AdminMainPage";
import DashboardPage from "./components/admin/DashboardPage";
import ProductManagePage from "./components/admin/ProductManagePage";
import WorkOrderPage from "./components/admin/WorkOrderPage";
import LoginPage from "./pages/Auth/LoginPage";

const App = () => {
  return (
    <>
      <GlobalStyle />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AdminMainPage />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductManagePage />} />
          <Route path="orders" element={<WorkOrderPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
