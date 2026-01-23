// src/App.js
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import GlobalStyle from "./style/GlobalStyle";

// --- Lazy Load Pages (Code Splitting) ---
// 초기 로딩 속도 개선을 위해 각 페이지를 동적으로 불러옵니다.

// Auth & Main Layout
const LoginPage = lazy(() => import("./pages/Auth/LoginPage"));
const AdminMainPage = lazy(() => import("./pages/admin/AdminMainPage"));

// Dashboard
const DashboardPage = lazy(
  () => import("./components/admin/dashboard/DashboardPage"),
);
const KpiPage = lazy(() => import("./components/admin/dashboard/KpiPage"));

// Production
const ProductionPlanPage = lazy(
  () => import("./components/admin/production/ProductionPlanPage"),
);
const WorkOrderPage = lazy(
  () => import("./components/admin/production/WorkOrderPage"),
);
const PerformancePage = lazy(
  () => import("./components/admin/production/PerformancePage"),
);
const WorkerPage = lazy(
  () => import("./components/admin/production/WorkerPage"),
);
const BarcodePage = lazy(
  () => import("./components/admin/production/BarcodePage"),
);

// Quality
const DefectPage = lazy(() => import("./components/admin/quality/DefectPage"));
const TrackingPage = lazy(
  () => import("./components/admin/quality/LotTrackingPage"),
);
const StandardPage = lazy(
  () => import("./components/admin/quality/StandardPage"),
);
const SpcChartPage = lazy(
  () => import("./components/admin/quality/SpcChartPage"),
);

// Resource & Material
const InventoryPage = lazy(
  () => import("./components/admin/material/InventoryPage"),
);
const MachinePage = lazy(
  () => import("./components/admin/material/MachinePage"),
);
const MaterialPage = lazy(
  () => import("./components/admin/material/MaterialPage"),
);

// MDM (Master Data Management)
const BOMPage = lazy(() => import("./components/admin/mdm/BOMPage"));
const EquipmentPage = lazy(
  () => import("./components/admin/mdm/EquipmentPage"),
);
const LocationPage = lazy(() => import("./components/admin/mdm/LocationPage"));
const ItemPage = lazy(() => import("./components/admin/mdm/ItemPage"));
const RoutingPage = lazy(() => import("./components/admin/mdm/RoutingPage"));

// System
const CodesPage = lazy(() => import("./components/admin/system/CodesPage"));
const LogsPage = lazy(() => import("./components/admin/system/LogsPage"));
const RolesPage = lazy(() => import("./components/admin/system/RolesPage"));
const UsersPage = lazy(() => import("./components/admin/system/UsersPage"));

// --- 로딩 UI 스타일 컴포넌트 ---
const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a4f8b;
  background-color: #f5f6fa;
`;

const App = () => {
  return (
    <>
      <GlobalStyle />
      {/* Suspense로 감싸서 페이지가 로딩되는 동안 LoadingScreen을 보여줍니다. */}
      <Suspense fallback={<LoadingScreen>Loading...</LoadingScreen>}>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/admin" element={<AdminMainPage />}>
            <Route index element={<DashboardPage />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/kpi" element={<KpiPage />} />

            {/* Production */}
            <Route path="production/plan" element={<ProductionPlanPage />} />
            <Route path="production/workorder" element={<WorkOrderPage />} />
            <Route
              path="production/performance"
              element={<PerformancePage />}
            />
            <Route path="production/worker" element={<WorkerPage />} />
            <Route path="production/barcode" element={<BarcodePage />} />

            {/* Quality */}
            <Route path="quality/defect" element={<DefectPage />} />
            <Route path="quality/tracking" element={<TrackingPage />} />
            <Route path="quality/standard" element={<StandardPage />} />
            <Route path="quality/spcchart" element={<SpcChartPage />} />

            {/* Resource */}
            <Route path="resource/inventory" element={<InventoryPage />} />
            <Route path="resource/machine" element={<MachinePage />} />
            <Route path="resource/material" element={<MaterialPage />} />

            {/* MDM */}
            <Route path="mdm/bom" element={<BOMPage />} />
            <Route path="mdm/equipment" element={<EquipmentPage />} />
            <Route path="mdm/location" element={<LocationPage />} />
            <Route path="mdm/item" element={<ItemPage />} />
            <Route path="mdm/routing" element={<RoutingPage />} />

            {/* System */}
            <Route path="system/codes" element={<CodesPage />} />
            <Route path="system/logs" element={<LogsPage />} />
            <Route path="system/roles" element={<RolesPage />} />
            <Route path="system/users" element={<UsersPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
