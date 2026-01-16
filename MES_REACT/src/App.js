// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import GlobalStyle from "./style/GlobalStyle";

// 페이지 Import
import AdminMainPage from "./pages/admin/AdminMainPage";
<<<<<<< HEAD
import DashboardPage from "./components/admin/DashboardPage";
import MaterialPage from "./components/admin/materialPage";
import WorkOrderPage from "./components/admin/WorkOrderPage";
import LoginPage from "./pages/Auth/LoginPage";
import Homepage from "./components/admin/HomePage";
=======
import DashboardPage from "./components/admin/dashboard/DashboardPage";
import MaterialPage from "./components/admin/material/MaterialPage";
import WorkOrderPage from "./components/admin/production/WorkOrderPage";
import LoginPage from "./pages/Auth/LoginPage";
import KpiPage from "./components/admin/dashboard/KpiPage";
import ProductionPlanPage from "./components/admin/production/ProductionPlanPage";
import PerformancePage from "./components/admin/production/PerformancePage";
import BOMPage from "./components/admin/mdm/BOMPage";
import EquipmentPage from "./components/admin/mdm/EquipmentPage";
import LocationPage from "./components/admin/mdm/LocationPage";
import ItemPage from "./components/admin/mdm/ItemPage";
import RoutingPage from "./components/admin/mdm/RoutingPage";
import CodesPage from "./components/admin/system/CodesPage";
import LogsPage from "./components/admin/system/LogsPage";
import RolesPage from "./components/admin/system/RolesPage";
import UsersPage from "./components/admin/system/UsersPage";
import InventoryPage from "./components/admin/material/InventoryPage";
import MachinePage from "./components/admin/material/MachinePage";
import DefectPage from "./components/admin/quality/DefectPage";
import TrackingPage from "./components/admin/quality/LotTrackingPage";
import StandardPage from "./components/admin/quality/StandardPage";
import WorkerPage from "./components/admin/production/WorkerPage";
import SpcChartPage from "./components/admin/quality/SpcChartPage";
import BarcodePage from "./components/admin/production/BarcodePage";
>>>>>>> origin/master

const App = () => {
  return (
    <>
      <GlobalStyle />

      <Routes>
<<<<<<< HEAD
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AdminMainPage />}>
          <Route index element={<Homepage />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="material" element={<MaterialPage />} />
          <Route path="workorder" element={<WorkOrderPage />} />
=======
        <Route path="/" element={<LoginPage />} />

        <Route path="/admin" element={<AdminMainPage />}>
          <Route index element={<DashboardPage />} />

          <Route path="dashboard/kpi" element={<KpiPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="production/plan" element={<ProductionPlanPage />} />
          <Route path="production/workorder" element={<WorkOrderPage />} />
          <Route path="production/performance" element={<PerformancePage />} />
          <Route path="production/worker" element={<WorkerPage />} />
          <Route path="production/barcode" element={<BarcodePage />} />

          <Route path="quality/defect" element={<DefectPage />} />
          <Route path="quality/tracking" element={<TrackingPage />} />
          <Route path="quality/standard" element={<StandardPage />} />
          <Route path="quality/spcchart" element={<SpcChartPage />} />

          <Route path="resource/inventory" element={<InventoryPage />} />
          <Route path="resource/machine" element={<MachinePage />} />
          <Route path="resource/material" element={<MaterialPage />} />

          <Route path="mdm/bom" element={<BOMPage />} />
          <Route path="mdm/equipment" element={<EquipmentPage />} />
          <Route path="mdm/location" element={<LocationPage />} />
          <Route path="mdm/item" element={<ItemPage />} />
          <Route path="mdm/routing" element={<RoutingPage />} />

          <Route path="system/codes" element={<CodesPage />} />
          <Route path="system/logs" element={<LogsPage />} />
          <Route path="system/roles" element={<RolesPage />} />
          <Route path="system/users" element={<UsersPage />} />
>>>>>>> origin/master
        </Route>
      </Routes>
    </>
  );
};

export default App;
