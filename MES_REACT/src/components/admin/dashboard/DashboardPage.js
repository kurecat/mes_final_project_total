// src/pages/dashboard/DashboardPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  FaIndustry,
  FaExclamationCircle,
  FaCheckCircle,
  FaMicrochip,
  FaArrowUp,
  FaArrowDown,
  FaTools,
  FaSync,
} from "react-icons/fa";
import {
  ComposedChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  fetchDashboardSummary,
  fetchHourlyOutput,
  fetchWipBalance,
  fetchEquipmentAlerts,
  ackEquipmentAlert,
} from "../../../api/dashboardApi";

/* ================= MOCK (Fallback) ================= */
const USE_MOCK = false;

const MOCK_DATA = {
  stats: {
    waferOut: 2510,
    waferOutTrend: 2.5,
    yield: 94.8,
    yieldTrend: 0.8,
    utilization: 88.5,
    utilizationTrend: -1.2,
    issues: 4,
  },
  productionTrend: [
    { time: "06:00", plan: 400, actual: 380 },
    { time: "08:00", plan: 450, actual: 440 },
    { time: "10:00", plan: 500, actual: 510 },
    { time: "12:00", plan: 400, actual: 200 },
    { time: "14:00", plan: 500, actual: 480 },
    { time: "16:00", plan: 500, actual: 495 },
    { time: "18:00", plan: 450, actual: 0 },
  ],
  wipBalance: [
    { step: "Clean", count: 1200 },
    { step: "Photo", count: 2600 },
    { step: "Etch", count: 1800 },
    { step: "Depo", count: 1500 },
    { step: "CMP", count: 800 },
    { step: "Implant", count: 600 },
    { step: "EDS", count: 2000 },
  ],
  alerts: [
    {
      id: 1,
      time: "14:25",
      equip: "Photo-02",
      msg: "Focus Error",
      level: "CRITICAL",
    },
    {
      id: 2,
      time: "14:10",
      equip: "Etch-05",
      msg: "Gas Leak",
      level: "CRITICAL",
    },
  ],
};

/* ================= Sub Components ================= */

const KpiBoard = React.memo(({ stats }) => (
  <KpiSection>
    <KpiCard>
      <CardHeader>
        <IconBox $color="#1a4f8b">
          <FaMicrochip />
        </IconBox>
        <TrendBadge $up={stats.waferOutTrend > 0}>
          {stats.waferOutTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(stats.waferOutTrend)}%
        </TrendBadge>
      </CardHeader>
      <KpiValue>
        {stats.waferOut.toLocaleString()} <small>wfrs</small>
      </KpiValue>
      <KpiLabel>Today's Wafer Out</KpiLabel>
      <ProgressBar $percent={90} $color="#1a4f8b" />
    </KpiCard>

    <KpiCard>
      <CardHeader>
        <IconBox $color="#2ecc71">
          <FaCheckCircle />
        </IconBox>
        <TrendBadge $up={stats.yieldTrend > 0}>
          {stats.yieldTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(stats.yieldTrend)}%
        </TrendBadge>
      </CardHeader>
      <KpiValue>
        {stats.yield} <small>%</small>
      </KpiValue>
      <KpiLabel>Prime Yield (Avg)</KpiLabel>
      <ProgressBar $percent={stats.yield} $color="#2ecc71" />
    </KpiCard>

    <KpiCard>
      <CardHeader>
        <IconBox $color="#f39c12">
          <FaTools />
        </IconBox>
        <TrendBadge $down={stats.utilizationTrend < 0}>
          {stats.utilizationTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(stats.utilizationTrend)}%
        </TrendBadge>
      </CardHeader>
      <KpiValue>
        {stats.utilization} <small>%</small>
      </KpiValue>
      <KpiLabel>Fab Utilization (OEE)</KpiLabel>
      <ProgressBar $percent={stats.utilization} $color="#f39c12" />
    </KpiCard>

    <KpiCard>
      <CardHeader>
        <IconBox $color="#e74c3c">
          <FaExclamationCircle />
        </IconBox>
        <span style={{ fontSize: 12, color: "#e74c3c", fontWeight: "bold" }}>
          Action Req.
        </span>
      </CardHeader>
      <KpiValue>
        {stats.issues} <small>cases</small>
      </KpiValue>
      <KpiLabel>Equipment Trouble</KpiLabel>
      <ProgressBar $percent={(stats.issues / 10) * 100} $color="#e74c3c" />
    </KpiCard>
  </KpiSection>
));

const ChartsBoard = React.memo(({ productionTrend, wipBalance }) => (
  <MainChartSection>
    <ChartCard style={{ flex: 1.5 }}>
      <SectionTitle>Hourly Wafer Output Trend</SectionTitle>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={productionTrend} margin={{ bottom: 30 }}>
          <CartesianGrid stroke="#f5f5f5" vertical={false} />
          <XAxis dataKey="time" dy={10} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="plan" fill="#e0e0e0" barSize={20} />
          <Line dataKey="actual" stroke="#1a4f8b" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard style={{ flex: 1 }}>
      <SectionTitle>WIP Balance (Bottleneck)</SectionTitle>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={wipBalance} layout="vertical">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="step" />
          <Bar dataKey="count">
            {wipBalance.map((e, i) => (
              <Cell key={i} fill={e.count > 2500 ? "#e74c3c" : "#3498db"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </MainChartSection>
));

const AlertBoard = React.memo(({ alerts, onAck }) => (
  <BottomSection>
    <SectionTitle>
      <FaExclamationCircle color="#e74c3c" /> Real-time Equipment Alerts
    </SectionTitle>
    <AlertTable>
      <thead>
        <tr>
          {/* ⭐ 각 컬럼의 너비를 %로 명시하여 고정합니다 */}
          <th style={{ width: "15%" }}>Time</th>
          <th style={{ width: "20%" }}>Equipment</th>
          <th style={{ width: "15%" }}>Level</th>
          <th style={{ width: "35%" }}>Message</th>
          <th style={{ width: "15%" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((a) => (
          <tr key={a.id}>
            <td>{a.time}</td>
            <td>
              <b>{a.equip}</b>
            </td>
            <td>
              <AlertBadge $level={a.level}>{a.level}</AlertBadge>
            </td>
            {/* 메시지가 너무 길 경우를 대비해 툴팁(title) 추가 */}
            <td title={a.msg} className="truncate">
              {a.msg}
            </td>
            <td>
              <ActionBtn onClick={() => onAck(a.id)}>Ack</ActionBtn>
            </td>
          </tr>
        ))}
        {/* 데이터가 없을 때의 처리 */}
        {alerts.length === 0 && (
          <tr>
            <td
              colSpan="5"
              style={{ textAlign: "center", color: "#999", padding: "30px" }}
            >
              No active equipment alerts.
            </td>
          </tr>
        )}
      </tbody>
    </AlertTable>
  </BottomSection>
));
/* ================= Main ================= */

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // DashboardPage.js 내의 fetchData 함수 부분 수정

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, hourly, wip, alertsRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchHourlyOutput(),
        fetchWipBalance(),
        fetchEquipmentAlerts(),
      ]);

      // 🔥 [수정] 서버에서 오는 다양한 필드명을 'msg' 하나로 통합 매핑
      const mappedAlerts = alertsRes.data.map((a) => ({
        id: a.id,
        // 1. 시간: created_at 또는 timestamp 필드 사용
        time: a.timestamp || a.created_at || a.time || "-",
        // 2. 장비: 장비 명칭 필드 확인
        equip: a.equipment_name || a.equip || a.equipment_id || "Unknown",
        // 3. 레벨: CRITICAL, INFO 등
        level: a.level || (a.event_type === "ERROR" ? "CRITICAL" : "INFO"),
        // 4. 메시지: 설비 로그의 'message' 또는 검사 결과의 'inspection_result' 가져오기
        msg: a.message || a.inspection_result || a.msg || "세부 내용 없음",
      }));

      setData({
        stats: summary.data,
        productionTrend: hourly.data,
        wipBalance: wip.data,
        alerts: mappedAlerts,
      });

      setLastUpdated(new Date());
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAck = async (id) => {
    try {
      await ackEquipmentAlert(id);
      fetchData();
    } catch (e) {
      console.error("Ack failed", e);
    }
  };

  if (!data) return <div style={{ padding: 20 }}>Loading dashboard...</div>;

  return (
    <Container>
      <Header>
        <PageTitle>
          <FaIndustry /> Fab Monitoring Dashboard
          {loading && <FaSync className="spin" />}
        </PageTitle>
        <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
      </Header>

      <KpiBoard stats={data.stats} />
      <ChartsBoard
        productionTrend={data.productionTrend}
        wipBalance={data.wipBalance}
      />
      <AlertBoard alerts={data.alerts} onAck={handleAck} />
    </Container>
  );
};

export default DashboardPage;

/* ================= Styled ================= */

const Container = styled.div`
  width: 100%;
  min-width: 100%;
  height: 100%;
  padding: 20px;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const PageTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
  }
`;
const KpiSection = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;
const KpiCard = styled.div`
  flex: 1;
  min-width: 200px;
  background: white;
  padding: 20px;
  border-radius: 12px;
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(p) => `${p.$color}15`};
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const TrendBadge = styled.div`
  font-size: 12px;
  color: ${(p) => (p.$up ? "#2ecc71" : "#e74c3c")};
`;
const KpiValue = styled.div`
  font-size: 28px;
  font-weight: 800;
`;
const KpiLabel = styled.div`
  font-size: 13px;
  color: #666;
`;
const ProgressBar = styled.div`
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 10px;
  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => p.$percent}%;
    background: ${(p) => p.$color};
  }
`;
const MainChartSection = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;
const ChartCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
`;
const SectionTitle = styled.h3`
  margin-bottom: 10px;
`;
const BottomSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
`;
const AlertTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
  background: white;

  th,
  td {
    padding: 12px 15px;
    text-align: left; /* ⭐ 왼쪽 정렬 통일 */
    vertical-align: middle;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fb;
    color: #7f8c8d;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  /* ⭐ 메시지가 길어질 경우 말줄임표(...) 처리 */
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  tr:hover {
    background-color: #fcfcfc;
  }
`;

// const AlertTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   th,
//   td {
//     padding: 10px;
//     border-bottom: 1px solid #eee;
//   }
// `;
const AlertBadge = styled.span`
  padding: 4px 8px;
  font-size: 11px;
  background: ${(p) => (p.$level === "CRITICAL" ? "#ffebee" : "#fff3e0")};
  color: ${(p) => (p.$level === "CRITICAL" ? "#c62828" : "#e67e22")};
`;
const ActionBtn = styled.button`
  border: 1px solid #dcdde1;
  padding: 6px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #2f3640;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f6fa;
    border-color: #1a4f8b;
    color: #1a4f8b;
  }
`;
