// src/pages/production/PerformancePage.js
import React, { useState, useEffect } from "react";
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
  {
    woId: "WO-MOD-105",
    product: "DDR5 32GB UDIMM",
    line: "Mod-Line-C",
    unit: "ea",
    planQty: 2000,
    actualQty: 2000,
    lossQty: 0,
    rate: 100.0,
    status: "COMPLETED",
  },
  {
    woId: "WO-FAB-002",
    product: "LPDDR5X Mobile",
    line: "Fab-Line-B",
    unit: "wfrs",
    planQty: 800,
    actualQty: 200,
    lossQty: 1,
    rate: 25.0,
    status: "RUNNING",
  },
];

const PerformancePage = () => {
  const [hourlyData, setHourlyData] = useState(MOCK_HOURLY);
  const [listData, setListData] = useState(MOCK_LIST);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("2026-01-20");
  const [selectedLine, setSelectedLine] = useState("ALL");

  // ✅ 추가/수정: KPI 요약 데이터를 서버에서 받아오기 위한 state
  const [summary, setSummary] = useState({
    totalPlanQty: 0,
    totalGoodQty: 0,
    totalDefectQty: 0,
    yieldRate: 0,
  });

  // ✅ 추가/수정: 백엔드 API BASE
  const API_BASE = "http://localhost:8111/api/mes";

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ 추가/수정: KPI 요약(금일 목표/생산/불량/수율) 백엔드 조회
      // GET /api/mes/performance/summary?date=YYYY-MM-DD&line=ALL
      const resSummary = await axios.get(`${API_BASE}/performance/summary`, {
        params: {
          date,
          line: selectedLine, // ALL / Fab / EDS / Module 등 그대로 전달
        },
      });

      // 서버 응답 예시:
      // {
      //   totalPlanQty: 455,
      //   totalGoodQty: 412,
      //   totalDefectQty: 4,
      //   yieldRate: 90.5
      // }
      setSummary({
        totalPlanQty: resSummary.data?.totalPlanQty ?? 0,
        totalGoodQty: resSummary.data?.totalGoodQty ?? 0,
        totalDefectQty: resSummary.data?.totalDefectQty ?? 0,
        yieldRate: resSummary.data?.yieldRate ?? 0,
      });

      // ⚠️ 차트/리스트는 현재 MOCK 유지 (원하면 다음 단계에서 DB 연동 가능)
      setTimeout(() => {
        setHourlyData(MOCK_HOURLY);
        setListData(MOCK_LIST);
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error(err);
       console.log("❌ API ERROR STATUS:", err?.response?.status);
  console.log("❌ API ERROR DATA:", err?.response?.data);
  console.log("❌ API ERROR MSG:", err.message);

      // ✅ 추가/수정: 서버 실패 시 KPI는 0으로 fallback
      setSummary({
        totalPlanQty: 100,
        totalGoodQty: 0,
        totalDefectQty: 0,
        yieldRate: 0,
      });

      setHourlyData(MOCK_HOURLY);
      setListData(MOCK_LIST);
      setLoading(false);
    }
  };

  // ✅ 수정: date/line 변경 시 재조회 되도록 변경
  useEffect(() => {
    fetchData();
  }, [date, selectedLine]);

  // ✅ 수정: KPI는 서버 값 사용
  const totalPlan = summary.totalPlanQty;
  const totalActual = summary.totalGoodQty;
  const totalScrap = summary.totalDefectQty;
  const achieveRate = summary.yieldRate;

  return (
    <Container>
      {/* 1. 상단 필터 및 타이틀 */}
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
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </DateInput>
          <SelectWrapper>
            <FaFilter color="#666" style={{ marginLeft: 10 }} />
           <Select
  value={selectedLine}
  onChange={(e) => setSelectedLine(e.target.value)}
>
  <option value="ALL">All Lines</option>
  <option value="Fab-Line-A">Fab-Line-A</option>      {/* ✅ 수정 */}
  <option value="EDS-Line-01">EDS-Line-01</option>    {/* ✅ 수정 */}
  <option value="Mod-Line-C">Mod-Line-C</option>      {/* ✅ 수정 */}
</Select>
          </SelectWrapper>
          <ExportButton>
            <FaFileDownload /> Export
          </ExportButton>
        </FilterGroup>
      </Header>

      {/* 2. KPI 요약 카드 */}
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

      {/* 3. 메인 컨텐츠 (차트 + 테이블) */}
      <ContentBody>
        {/* 좌측: 시간대별 실적 차트 (Fab Wafer 기준) */}
        <ChartSection>
          <SectionHeader>
            <SectionTitle>Hourly Output Trend (Fab Wafer Out)</SectionTitle>
          </SectionHeader>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={hourlyData}
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
                fill="#e0e0e0"
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

        {/* 우측: 공정별/제품별 상세 리스트 */}
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
                {listData.map((row) => (
                  <tr key={row.woId}>
                    <td>{row.line}</td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>
                      {row.product}
                    </td>
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
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </ListSection>
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
