// src/pages/production/PerformancePage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
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
  {
    woId: "WO-MOD-099",
    product: "DDR5 Module",
    line: "Mod-Line-C",
    unit: "ea",
    planQty: 2000,
    actualQty: 2000,
    lossQty: 0,
    rate: 100.0,
    status: "COMPLETED",
  },
];

// --- Sub-Components ---

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
                style={{ fontSize: 14, marginLeft: 10, color: "#aaa" }}
              />
            )}
          </PageTitle>
          <SubTitle>Real-time Output & Achievement Rate</SubTitle>
        </TitleArea>
        <FilterGroup>
          <DateInput>
            <FaCalendarAlt color="#666" size={14} />
            <input type="date" value={date} onChange={onDateChange} />
          </DateInput>
          <SelectWrapper>
            <FaFilter color="#666" size={14} style={{ marginLeft: 10 }} />
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

// 3. Chart Component (높이 100%로 수정)
const HourlyChart = React.memo(({ data }) => {
  return (
    <ChartSection>
      <SectionHeader>
        <SectionTitle>Hourly Output Trend (Fab Wafer Out)</SectionTitle>
      </SectionHeader>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{
                value: "Wafer (wfrs)",
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
                fill: "#999",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{
                value: "Scrap",
                angle: 90,
                position: "insideRight",
                fontSize: 12,
                fill: "#999",
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar
              yAxisId="left"
              dataKey="plan"
              name="Plan"
              fill="#e0e0e0"
              barSize={16}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="actual"
              name="Actual"
              fill="#1a4f8b"
              barSize={16}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="scrap"
              name="Scrap/Loss"
              stroke="#e74c3c"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartSection>
  );
});

// 4. List Table Row
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resSummary = await axiosInstance.get(
        `${API_BASE}/performance/summary`,
        { params: { date, line: selectedLine } },
      );
      setSummary({
        totalPlanQty: resSummary.data?.totalPlanQty ?? 0,
        totalGoodQty: resSummary.data?.totalGoodQty ?? 0,
        totalDefectQty: resSummary.data?.totalDefectQty ?? 0,
        yieldRate: resSummary.data?.yieldRate ?? 0,
      });

      const resHourly = await axiosInstance.get(
        `${API_BASE}/performance/hourly`,
        { params: { date, line: selectedLine } },
      );
      setHourlyData(resHourly.data ?? []);

      const resList = await axiosInstance.get(`${API_BASE}/performance/list`, {
        params: { date, line: selectedLine },
      });
      setListData(resList.data ?? []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setSummary({
        totalPlanQty: 52400,
        totalGoodQty: 51050,
        totalDefectQty: 25,
        yieldRate: 97.4,
      });
      setHourlyData(MOCK_HOURLY);
      setListData(MOCK_LIST);
      setLoading(false);
    }
  }, [date, selectedLine]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = useCallback((e) => {
    setDate(e.target.value);
  }, []);

  const handleLineChange = useCallback((e) => {
    setSelectedLine(e.target.value);
  }, []);

  const handleExport = useCallback(() => {
    alert("Exporting data...");
  }, []);

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
      <PerformanceHeader
        loading={loading}
        date={date}
        onDateChange={handleDateChange}
        selectedLine={selectedLine}
        onLineChange={handleLineChange}
        onExport={handleExport}
      />

      <KpiBoard summary={summaryData} />

      <ContentBody>
        <HourlyChart data={hourlyData} />
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
  padding: 16px;
  /* padding-bottom 제거: 화면 꽉 차게 하기 위함 */
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden; /* 이중 스크롤 방지 */
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 헤더 크기 고정 */
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SubTitle = styled.span`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  margin-left: 28px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const DateInput = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  input {
    border: none;
    outline: none;
    font-family: inherit;
    color: #333;
    font-size: 13px;
  }
`;
const SelectWrapper = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;
const Select = styled.select`
  padding: 6px 10px;
  border: none;
  outline: none;
  background: transparent;
  color: #555;
  font-size: 13px;
`;

const ExportButton = styled.button`
  background-color: #2e7d32;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  &:hover {
    background-color: #1b5e20;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex-shrink: 0; /* KPI 카드 크기 고정 */
`;
const KpiCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;
const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;
const KpiInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const Label = styled.span`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;
const Value = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: #333;
`;
const Unit = styled.span`
  font-size: 13px;
  color: #999;
  font-weight: 500;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;
const PercentValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #1a4f8b;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${(props) => props.$width}%;
  height: 100%;
  background-color: ${(props) => props.$color};
  transition: width 0.5s ease;
`;

// 컨텐츠 영역: flex: 1로 남은 공간 모두 차지
const ContentBody = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0; /* 자식 요소의 스크롤을 위해 필수 */
  margin-bottom: 16px; /* 하단에 약간의 여백 */
`;

const ChartSection = styled.div`
  flex: 1.2;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  /* 고정 높이 제거하고 부모(ContentBody) 높이에 맞춤 */
  height: 100%;
  overflow: hidden;
`;

// 차트 감싸는 div (높이 100% 필수)
const ChartWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
`;

const ListSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  margin-bottom: 16px;
  flex-shrink: 0;
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 700;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto; /* 테이블 내용만 스크롤 */
  min-height: 0;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th {
    text-align: left;
    padding: 10px;
    background-color: #f9f9f9;
    color: #666;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
  }
`;

const StatusBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "COMPLETED" ? "#e8f5e9" : "#fff3e0"};
  color: ${(props) => (props.$status === "COMPLETED" ? "#2e7d32" : "#e67e22")};
`;
