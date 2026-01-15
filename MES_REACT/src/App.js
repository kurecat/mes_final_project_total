// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import GlobalStyle from "./style/GlobalStyle";

// 페이지 Import
import AdminMainPage from "./pages/admin/AdminMainPage";
import DashboardPage from "./components/admin/DashboardPage";
import MaterialPage from "./components/admin/materialPage";
import WorkOrderPage from "./components/admin/WorkOrderPage";
import LoginPage from "./pages/Auth/LoginPage";
import Homepage from "./components/admin/HomePage";

const App = () => {
  return (
    <>
      <GlobalStyle />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AdminMainPage />}>
          <Route index element={<Homepage />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="material" element={<MaterialPage />} />
          <Route path="workorder" element={<WorkOrderPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
