// src/pages/production/PerformancePage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaCalendarAlt,
  FaSearch,
  FaFileDownload,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
  FaClipboardList,
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
  Area,
} from "recharts";

// --- Mock Data (시간대별 생산 실적) ---
const HOURLY_DATA = [
  { time: "08:00", plan: 100, actual: 95, defect: 2 },
  { time: "09:00", plan: 100, actual: 102, defect: 0 },
  { time: "10:00", plan: 100, actual: 98, defect: 1 },
  { time: "11:00", plan: 100, actual: 100, defect: 0 },
  { time: "12:00", plan: 100, actual: 40, defect: 0 }, // 점심시간
  { time: "13:00", plan: 100, actual: 99, defect: 3 },
  { time: "14:00", plan: 100, actual: 105, defect: 1 },
  { time: "15:00", plan: 100, actual: 88, defect: 5 }, // 설비 이슈 발생 가정
  { time: "16:00", plan: 100, actual: 0, defect: 0 }, // 미래 시간
];

// --- Mock Data (작업지시별 실적 리스트) ---
const WO_PERFORMANCE = [
  {
    woId: "WO-20240520-001",
    product: "HBM3 8-Hi Stack",
    line: "Line-A",
    planQty: 500,
    actualQty: 498,
    defectQty: 2,
    rate: 99.6,
    status: "COMPLETED",
  },
  {
    woId: "WO-20240520-002",
    product: "HBM3 12-Hi Stack",
    line: "Line-B",
    planQty: 300,
    actualQty: 150,
    defectQty: 5,
    rate: 50.0,
    status: "RUNNING",
  },
  {
    woId: "WO-20240520-003",
    product: "DDR5 Module",
    line: "Line-C",
    planQty: 1000,
    actualQty: 850,
    defectQty: 12,
    rate: 85.0,
    status: "RUNNING",
  },
];

const PerformancePage = () => {
  const [date, setDate] = useState("2024-05-20");
  const [selectedLine, setSelectedLine] = useState("ALL");

  // KPI 계산 (Mock Data 기반)
  const totalPlan = HOURLY_DATA.reduce((acc, cur) => acc + cur.plan, 0);
  const totalActual = HOURLY_DATA.reduce((acc, cur) => acc + cur.actual, 0);
  const totalDefect = HOURLY_DATA.reduce((acc, cur) => acc + cur.defect, 0);
  const achieveRate = ((totalActual / totalPlan) * 100).toFixed(1);

  return (
    <Container>
      {/* 1. 상단 필터 및 타이틀 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaChartLine /> Production Performance
          </PageTitle>
          <SubTitle>실시간 생산 실적 집계 현황</SubTitle>
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
          <Select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            <option value="ALL">All Lines</option>
            <option value="Line-A">Line-A (HBM)</option>
            <option value="Line-B">Line-B (HBM)</option>
            <option value="Line-C">Line-C (DDR)</option>
          </Select>
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
            <Label>Total Plan (계획)</Label>
            <Value>
              {totalPlan.toLocaleString()} <Unit>ea</Unit>
            </Value>
          </KpiInfo>
        </KpiCard>

        <KpiCard>
          <IconBox $color="#2ecc71">
            <FaCheckCircle />
          </IconBox>
          <KpiInfo>
            <Label>Total Actual (실적)</Label>
            <Value>
              {totalActual.toLocaleString()} <Unit>ea</Unit>
            </Value>
          </KpiInfo>
        </KpiCard>

        <KpiCard>
          <IconBox $color="#e74c3c">
            <FaExclamationCircle />
          </IconBox>
          <KpiInfo>
            <Label>Total Defect (불량)</Label>
            <Value style={{ color: "#e74c3c" }}>
              {totalDefect.toLocaleString()} <Unit>ea</Unit>
            </Value>
          </KpiInfo>
        </KpiCard>

        <KpiCard>
          <KpiInfo style={{ width: "100%" }}>
            <Row>
              <Label>Achievement Rate (달성률)</Label>
              <PercentValue>{achieveRate}%</PercentValue>
            </Row>
            <ProgressBar>
              <ProgressFill
                $width={achieveRate}
                $color={achieveRate >= 90 ? "#2ecc71" : "#f39c12"}
              />
            </ProgressBar>
          </KpiInfo>
        </KpiCard>
      </KpiGrid>

      {/* 3. 메인 컨텐츠 (차트 + 테이블) */}
      <ContentBody>
        {/* 좌측: 시간대별 실적 차트 */}
        <ChartSection>
          <SectionTitle>Hourly Production Trend (시간대별 추이)</SectionTitle>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={HOURLY_DATA}
              margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                yAxisId="left"
                label={{ value: "Qty", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Defect", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="plan"
                name="Plan (목표)"
                fill="#e0e0e0"
                barSize={20}
              />
              <Bar
                yAxisId="left"
                dataKey="actual"
                name="Actual (실적)"
                fill="#1a4f8b"
                barSize={20}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="defect"
                name="Defect (불량)"
                stroke="#e74c3c"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* 우측: 작업지시별 상세 리스트 */}
        <ListSection>
          <SectionTitle>Work Order Performance (작업지시별 현황)</SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Product Name</th>
                  <th>Plan</th>
                  <th>Actual</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {WO_PERFORMANCE.map((row) => (
                  <tr key={row.woId}>
                    <td>{row.line}</td>
                    <td style={{ fontWeight: 600 }}>{row.product}</td>
                    <td>{row.planQty}</td>
                    <td>{row.actualQty}</td>
                    <td>
                      <RateBadge $rate={row.rate}>{row.rate}%</RateBadge>
                    </td>
                    <td>
                      <StatusBadge $status={row.status}>
                        {row.status}
                      </StatusBadge>
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

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  background: white;
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

// KPI Section
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

// Body Layout
const ContentBody = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0; /* Nested scroll support */
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

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
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

const RateBadge = styled.span`
  color: ${(props) =>
    props.$rate >= 95 ? "#2ecc71" : props.$rate >= 80 ? "#f39c12" : "#e74c3c"};
  font-weight: 700;
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
