// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import GlobalStyle from "./style/GlobalStyle";

// 페이지 Import (최신 경로로 통일)
import LoginPage from "./pages/Auth/LoginPage";
import AdminMainPage from "./pages/admin/AdminMainPage";

// Dashboard
import DashboardPage from "./components/admin/dashboard/DashboardPage";
import KpiPage from "./components/admin/dashboard/KpiPage";

// Production
import ProductionPlanPage from "./components/admin/production/ProductionPlanPage";
import WorkOrderPage from "./components/admin/production/WorkOrderPage";
import PerformancePage from "./components/admin/production/PerformancePage";
import WorkerPage from "./components/admin/production/WorkerPage";
import BarcodePage from "./components/admin/production/BarcodePage";

// Material
import MaterialPage from "./components/admin/material/MaterialPage";
import InventoryPage from "./components/admin/material/InventoryPage";
import MachinePage from "./components/admin/material/MachinePage";

// Quality
import DefectPage from "./components/admin/quality/DefectPage";
import TrackingPage from "./components/admin/quality/LotTrackingPage";
import StandardPage from "./components/admin/quality/StandardPage";
import SpcChartPage from "./components/admin/quality/SpcChartPage";

// MDM
import BOMPage from "./components/admin/mdm/BOMPage";
import EquipmentPage from "./components/admin/mdm/EquipmentPage";
import LocationPage from "./components/admin/mdm/LocationPage";
import ItemPage from "./components/admin/mdm/ItemPage";
import RoutingPage from "./components/admin/mdm/RoutingPage";

// System
import CodesPage from "./components/admin/system/CodesPage";
import LogsPage from "./components/admin/system/LogsPage";
import RolesPage from "./components/admin/system/RolesPage";
import UsersPage from "./components/admin/system/UsersPage";

// import Homepage from "./components/admin/HomePage"; // 필요하면 주석 해제 (보통 대시보드가 메인이라 주석처리함)

const App = () => {
  return (
    <>
      <GlobalStyle />
      <Routes>
        {/* 로그인 페이지 (기본 경로) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 관리자 페이지 (Layout) */}
        <Route path="/admin" element={<AdminMainPage />}>
          {/* Admin 메인 (Dashboard) */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/kpi" element={<KpiPage />} />

          {/* 생산 관리 */}
          <Route path="production/plan" element={<ProductionPlanPage />} />
          <Route path="production/workorder" element={<WorkOrderPage />} />
          <Route path="production/performance" element={<PerformancePage />} />
          <Route path="production/worker" element={<WorkerPage />} />
          <Route path="production/barcode" element={<BarcodePage />} />

          {/* 품질 관리 */}
          <Route path="quality/defect" element={<DefectPage />} />
          <Route path="quality/tracking" element={<TrackingPage />} />
          <Route path="quality/standard" element={<StandardPage />} />
          <Route path="quality/spcchart" element={<SpcChartPage />} />

          {/* 자재/설비 관리 */}
          <Route path="resource/inventory" element={<InventoryPage />} />
          <Route path="resource/machine" element={<MachinePage />} />
          <Route path="resource/material" element={<MaterialPage />} />

          {/* 기준 정보 (MDM) */}
          <Route path="mdm/bom" element={<BOMPage />} />
          <Route path="mdm/equipment" element={<EquipmentPage />} />
          <Route path="mdm/location" element={<LocationPage />} />
          <Route path="mdm/item" element={<ItemPage />} />
          <Route path="mdm/routing" element={<RoutingPage />} />

          {/* 시스템 관리 */}
          <Route path="system/codes" element={<CodesPage />} />
          <Route path="system/logs" element={<LogsPage />} />
          <Route path="system/roles" element={<RolesPage />} />
          <Route path="system/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
