// src/App.js
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import GlobalStyle from "./style/GlobalStyle";

// [최적화 1] 초기 로딩 속도를 위해 로그인 페이지는 일반 import 유지 (즉시 렌더링)
import LoginPage from "./pages/Auth/LoginPage";

// [최적화 2] 나머지 무거운 Admin 페이지들은 Lazy Import로 전환 (Code Splitting)
// -> 사용자가 해당 메뉴를 클릭할 때 js 파일을 다운로드 받습니다.

// Admin Layout
const AdminMainPage = lazy(() => import("./pages/admin/AdminMainPage"));

// Dashboard
const DashboardPage = lazy(
  () => import("./components/admin/dashboard/DashboardPage"),
);
const KpiPage = lazy(() => import("./components/admin/dashboard/KpiPage"));

// Production (생산)
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

// Quality (품질)
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

// Resource / Material (자재/설비)
const InventoryPage = lazy(
  () => import("./components/admin/material/InventoryPage"),
);
const MachinePage = lazy(
  () => import("./components/admin/material/MachinePage"),
);
const MaterialPage = lazy(
  () => import("./components/admin/material/MaterialPage"),
);

// MDM (기준정보)
const BOMPage = lazy(() => import("./components/admin/mdm/BOMPage"));
const EquipmentPage = lazy(
  () => import("./components/admin/mdm/EquipmentPage"),
);
const LocationPage = lazy(() => import("./components/admin/mdm/LocationPage"));
const ItemPage = lazy(() => import("./components/admin/mdm/ItemPage"));
const RoutingPage = lazy(() => import("./components/admin/mdm/RoutingPage"));

// System (시스템)
const CodesPage = lazy(() => import("./components/admin/system/CodesPage"));
const LogsPage = lazy(() => import("./components/admin/system/LogsPage"));
const RolesPage = lazy(() => import("./components/admin/system/RolesPage"));
const UsersPage = lazy(() => import("./components/admin/system/UsersPage"));

const App = () => {
  return (
    <>
      <GlobalStyle />

      {/* [최적화 3] Suspense로 감싸서 로딩 중일 때 보여줄 UI 설정 */}
      <Suspense fallback={<LoadingScreen>Loading...</LoadingScreen>}>
        <Routes>
          {/* 로그인 페이지는 즉시 로딩 */}
          <Route path="/" element={<LoginPage />} />

          {/* Admin 하위 페이지들은 필요할 때 로딩 */}
          <Route path="/admin" element={<AdminMainPage />}>
            <Route index element={<DashboardPage />} />

            <Route path="dashboard/kpi" element={<KpiPage />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="production/plan" element={<ProductionPlanPage />} />
            <Route path="production/workorder" element={<WorkOrderPage />} />
            <Route
              path="production/performance"
              element={<PerformancePage />}
            />
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
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;

// --- 로딩 UI 스타일 컴포넌트 ---
const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a4f8b;
  background-color: #f5f6fa;
`;
