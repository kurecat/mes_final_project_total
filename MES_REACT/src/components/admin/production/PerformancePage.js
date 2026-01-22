// src/pages/production/PerformancePage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaCalendarAlt,
  FaFileDownload,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
  FaClipboardList,
  FaFilter,
  FaSync,
} from "react-icons/fa";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Fallback Mock Data ---
const MOCK_HOURLY = [
  { time: "08:00", plan: 50, actual: 48, scrap: 0 },
  { time: "09:00", plan: 55, actual: 55, scrap: 0 },
  { time: "10:00", plan: 60, actual: 58, scrap: 1 },
  { time: "11:00", plan: 60, actual: 62, scrap: 0 },
  { time: "12:00", plan: 50, actual: 45, scrap: 0 },
  { time: "13:00", plan: 60, actual: 59, scrap: 0 },
  { time: "14:00", plan: 60, actual: 30, scrap: 2 },
  { time: "15:00", plan: 60, actual: 55, scrap: 1 },
];

const MOCK_LIST = [
  {
    woId: "WO-FAB-001",
    product: "DDR5 1znm Wafer",
    line: "Fab-Line-A",
    unit: "wfrs",
    planQty: 1200,
    actualQty: 1150,
    lossQty: 5,
    rate: 95.8,
    status: "RUNNING",
  },
  {
    woId: "WO-EDS-023",
    product: "16Gb DDR5 SDRAM",
    line: "EDS-Line-01",
    unit: "chips",
    planQty: 50000,
    actualQty: 48500,
    lossQty: 1200,
    rate: 97.0,
    status: "RUNNING",
  },
];

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Component
const PerformanceHeader = React.memo(
  ({ loading, date, onDateChange, selectedLine, onLineChange, onExport }) => {
    return (
      <Header>
        <TitleArea>
          <PageTitle>
            <FaChartLine /> Production Performance
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Real-time Output & Achievement Rate</SubTitle>
        </TitleArea>
        <FilterGroup>
          <DateInput>
            <FaCalendarAlt color="#666" />
            <input type="date" value={date} onChange={onDateChange} />
          </DateInput>
          <SelectWrapper>
            <FaFilter color="#666" style={{ marginLeft: 10 }} />
            <Select value={selectedLine} onChange={onLineChange}>
              <option value="ALL">All Lines</option>
              <option value="Fab-Line-A">Fab-Line-A</option>
              <option value="EDS-Line-01">EDS-Line-01</option>
              <option value="Mod-Line-C">Mod-Line-C</option>
            </Select>
          </SelectWrapper>
          <ExportButton onClick={onExport}>
            <FaFileDownload /> Export
          </ExportButton>
        </FilterGroup>
      </Header>
    );
  },
);

// 2. KPI Board Component
const KpiBoard = React.memo(({ summary }) => {
  const { totalPlan, totalActual, totalScrap, achieveRate } = summary;

  return (
    <KpiGrid>
      <KpiCard>
        <IconBox $color="#1a4f8b">
          <FaClipboardList />
        </IconBox>
        <KpiInfo>
          <Label>Daily Plan</Label>
          <Value>
            {Number(totalPlan).toLocaleString()} <Unit>wfrs</Unit>
          </Value>
        </KpiInfo>
      </KpiCard>

      <KpiCard>
        <IconBox $color="#2ecc71">
          <FaCheckCircle />
        </IconBox>
        <KpiInfo>
          <Label>Daily Output</Label>
          <Value>
            {Number(totalActual).toLocaleString()} <Unit>wfrs</Unit>
          </Value>
        </KpiInfo>
      </KpiCard>

      <KpiCard>
        <IconBox $color="#e74c3c">
          <FaExclamationCircle />
        </IconBox>
        <KpiInfo>
          <Label>Scrap / Loss</Label>
          <Value style={{ color: "#e74c3c" }}>
            {Number(totalScrap).toLocaleString()} <Unit>wfrs</Unit>
          </Value>
        </KpiInfo>
      </KpiCard>

      <KpiCard>
        <KpiInfo style={{ width: "100%" }}>
          <Row>
            <Label>Achievement Rate</Label>
            <PercentValue>{Number(achieveRate).toFixed(1)}%</PercentValue>
          </Row>
          <ProgressBar>
            <ProgressFill
              $width={Math.min(Number(achieveRate), 100)}
              $color={Number(achieveRate) >= 95 ? "#2ecc71" : "#f39c12"}
            />
          </ProgressBar>
        </KpiInfo>
      </KpiCard>
    </KpiGrid>
  );
});

// 3. Chart Component
const HourlyChart = React.memo(({ data }) => {
  return (
    <ChartSection>
      <SectionHeader>
        <SectionTitle>Hourly Output Trend (Fab Wafer Out)</SectionTitle>
      </SectionHeader>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            yAxisId="left"
            label={{
              value: "Wafer (wfrs)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "Scrap", angle: 90, position: "insideRight" }}
          />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="plan"
            name="Plan"
            fill="#a79d9d"
            barSize={20}
          />
          <Bar
            yAxisId="left"
            dataKey="actual"
            name="Actual"
            fill="#1a4f8b"
            barSize={20}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="scrap"
            name="Scrap/Loss"
            stroke="#e74c3c"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartSection>
  );
});

// 4. List Table Row (for virtualization/performance)
const WorkOrderRow = React.memo(({ row }) => {
  return (
    <tr>
      <td>{row.line}</td>
      <td style={{ fontWeight: 600, fontSize: 13 }}>{row.product}</td>
      <td style={{ color: "#666", fontSize: 12 }}>{row.unit}</td>
      <td>{row.planQty.toLocaleString()}</td>
      <td>{row.actualQty.toLocaleString()}</td>
      <td style={{ color: row.lossQty > 0 ? "#e74c3c" : "#ccc" }}>
        {row.lossQty > 0 ? row.lossQty.toLocaleString() : "-"}
      </td>
      <td>
        <StatusBadge $status={row.status}>{row.status}</StatusBadge>
      </td>
    </tr>
  );
});

// 5. List Table Component
const WorkOrderTable = React.memo(({ data }) => {
  return (
    <ListSection>
      <SectionHeader>
        <SectionTitle>Work Order Performance Detail</SectionTitle>
      </SectionHeader>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>Line</th>
              <th>Product</th>
              <th>Unit</th>
              <th>Plan</th>
              <th>Actual</th>
              <th>Loss</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <WorkOrderRow key={row.woId} row={row} />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </ListSection>
  );
});

// --- Main Component ---

const PerformancePage = () => {
  const [hourlyData, setHourlyData] = useState(MOCK_HOURLY);
  const [listData, setListData] = useState(MOCK_LIST);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("2026-01-20");
  const [selectedLine, setSelectedLine] = useState("ALL");

  const [summary, setSummary] = useState({
    totalPlanQty: 0,
    totalGoodQty: 0,
    totalDefectQty: 0,
    yieldRate: 0,
  });

  const API_BASE = "http://localhost:8111/api/mes";

  // 1. fetchData with useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1) KPI Summary
      const resSummary = await axios.get(`${API_BASE}/performance/summary`, {
        params: { date, line: selectedLine },
      });

      setSummary({
        totalPlanQty: resSummary.data?.totalPlanQty ?? 0,
        totalGoodQty: resSummary.data?.totalGoodQty ?? 0,
        totalDefectQty: resSummary.data?.totalDefectQty ?? 0,
        yieldRate: resSummary.data?.yieldRate ?? 0,
      });

      // 2) Hourly Chart
      const resHourly = await axios.get(`${API_BASE}/performance/hourly`, {
        params: { date, line: selectedLine },
      });
      setHourlyData(resHourly.data ?? []);

      // 3) List Data
      const resList = await axios.get(`${API_BASE}/performance/list`, {
        params: { date, line: selectedLine },
      });
      setListData(resList.data ?? []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      // Fallback
      setSummary({
        totalPlanQty: 0,
        totalGoodQty: 0,
        totalDefectQty: 0,
        yieldRate: 0,
      });
      setHourlyData(MOCK_HOURLY);
      setListData(MOCK_LIST);
      setLoading(false);
    }
  }, [date, selectedLine]);

  // 2. useEffect depends on fetchData
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Handlers with useCallback
  const handleDateChange = useCallback((e) => {
    setDate(e.target.value);
  }, []);

  const handleLineChange = useCallback((e) => {
    setSelectedLine(e.target.value);
  }, []);

  const handleExport = useCallback(() => {
    alert("Exporting data...");
  }, []);

  // 4. Memoize Summary Object
  const summaryData = useMemo(
    () => ({
      totalPlan: summary.totalPlanQty,
      totalActual: summary.totalGoodQty,
      totalScrap: summary.totalDefectQty,
      achieveRate: summary.yieldRate,
    }),
    [summary],
  );

  return (
    <Container>
      {/* 1. Header (Memoized) */}
      <PerformanceHeader
        loading={loading}
        date={date}
        onDateChange={handleDateChange}
        selectedLine={selectedLine}
        onLineChange={handleLineChange}
        onExport={handleExport}
      />

      {/* 2. KPI Section (Memoized) */}
      <KpiBoard summary={summaryData} />

      {/* 3. Main Content */}
      <ContentBody>
        {/* Left: Chart (Memoized) */}
        <HourlyChart data={hourlyData} />

        {/* Right: List (Memoized) */}
        <WorkOrderTable data={listData} />
      </ContentBody>
    </Container>
  );
};

export default PerformancePage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  font-size: 22px;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
    color: #aaa;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 32px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const DateInput = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  input {
    border: none;
    outline: none;
    font-family: inherit;
    color: #333;
  }
`;
const SelectWrapper = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;
const Select = styled.select`
  padding: 8px 12px;
  border: none;
  outline: none;
  background: transparent;
  color: #555;
`;

const ExportButton = styled.button`
  background-color: #2e7d32;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background-color: #1b5e20;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;
const KpiCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
`;
const IconBox = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;
const KpiInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const Label = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;
const Value = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;
const Unit = styled.span`
  font-size: 14px;
  color: #999;
  font-weight: 500;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;
const PercentValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1a4f8b;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${(props) => props.$width}%;
  height: 100%;
  background-color: ${(props) => props.$color};
  transition: width 0.5s ease;
`;

const ContentBody = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
`;
const ChartSection = styled.div`
  flex: 3;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;
const ListSection = styled.div`
  flex: 2;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 700;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th {
    text-align: left;
    padding: 12px;
    background-color: #f9f9f9;
    color: #666;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "COMPLETED" ? "#e8f5e9" : "#fff3e0"};
  color: ${(props) => (props.$status === "COMPLETED" ? "#2e7d32" : "#e67e22")};
`;
