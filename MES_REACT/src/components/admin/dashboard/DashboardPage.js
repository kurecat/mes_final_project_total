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
          <th>Time</th>
          <th>Equipment</th>
          <th>Level</th>
          <th>Message</th>
          <th>Status</th>
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
            <td>{a.msg}</td>
            <td>
              <ActionBtn onClick={() => onAck(a.id)}>Ack</ActionBtn>
            </td>
          </tr>
        ))}
      </tbody>
    </AlertTable>
  </BottomSection>
));

/* ================= Main ================= */

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        setData(MOCK_DATA);
        return;
      }

      const [summary, hourly, wip, alerts] = await Promise.all([
        fetchDashboardSummary(),
        fetchHourlyOutput(),
        fetchWipBalance(),
        fetchEquipmentAlerts(),
      ]);

      setData({
        stats: summary.data,
        productionTrend: hourly.data,
        wipBalance: wip.data,
        alerts: alerts.data,
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
  table-layout: fixed; /* ⭐ 핵심 */
  font-size: 14px;

  th,
  td {
    padding: 12px;
    vertical-align: middle; /* ⭐ 행 기준선 정렬 */
  }

  th {
    background: #f9f9f9;
    color: #666;
    border-bottom: 1px solid #eee;
  }

  td {
    border-bottom: 1px solid #f5f5f5;
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
  border: 1px solid #ddd;
  padding: 4px 10px;
  background: white;
  cursor: pointer;
`;
