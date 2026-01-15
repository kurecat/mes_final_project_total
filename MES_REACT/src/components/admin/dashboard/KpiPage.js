// src/pages/dashboard/KpiPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaChartPie,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaPercentage,
  FaStopwatch,
  FaChartLine,
  FaIndustry,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";

// --- Fallback Mock Data ---
const MOCK_KPI_DATA = {
  summary: {
    avgYield: 94.5,
    yieldTarget: 96.0,
    totalOutput: 15400, // Weekly Wafer
    cycleTime: 45.2, // Days (Fab In -> Out)
    avgOee: 88.2,
  },
  // 1. 주간 수율 트렌드 (Prime vs Final)
  yieldTrend: [
    { date: "W20", prime: 88.5, final: 93.2, target: 95 },
    { date: "W21", prime: 89.1, final: 93.8, target: 95 },
    { date: "W22", prime: 88.0, final: 92.5, target: 95 }, // 이슈 발생
    { date: "W23", prime: 90.2, final: 94.5, target: 95 },
    { date: "W24", prime: 91.5, final: 95.8, target: 95 },
    { date: "W25", prime: 92.0, final: 96.2, target: 95 }, // 목표 달성
  ],
  // 2. EDS Bin Loss Pareto (불량 원인 분석)
  binLoss: [
    { type: "Single Bit", count: 1250, desc: "Repairable" },
    { type: "Multi Bit", count: 850, desc: "Non-Repair" },
    { type: "Open/Short", count: 620, desc: "Hard Fail" },
    { type: "Func Fail", count: 450, desc: "Logic Error" },
    { type: "Leakage", count: 300, desc: "Power Spec" },
  ],
  // 3. 설비 종합 효율 (OEE) - 공정별
  equipmentOee: [
    {
      group: "Photo",
      availability: 95,
      performance: 92,
      quality: 99,
      oee: 86.5,
    },
    {
      group: "Etch",
      availability: 90,
      performance: 88,
      quality: 98,
      oee: 77.6,
    },
    {
      group: "Depo",
      availability: 92,
      performance: 95,
      quality: 99,
      oee: 86.5,
    },
    { group: "CMP", availability: 85, performance: 90, quality: 97, oee: 74.2 },
  ],
};

const KpiPage = () => {
  const [kpiData, setKpiData] = useState(MOCK_KPI_DATA);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("WEEKLY");

  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API 연동 시: http://localhost:3001/kpi
      // const res = await axios.get("http://localhost:3001/kpi");
      // setKpiData(res.data);

      setTimeout(() => {
        setKpiData(MOCK_KPI_DATA);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      {/* 1. 헤더 컨트롤 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaChartPie /> KPI Analytics
          </PageTitle>
          <SubTitle>Yield, Productivity & Loss Analysis</SubTitle>
        </TitleArea>
        <ControlGroup>
          <ButtonGroup>
            <PeriodBtn
              $active={period === "DAILY"}
              onClick={() => setPeriod("DAILY")}
            >
              Daily
            </PeriodBtn>
            <PeriodBtn
              $active={period === "WEEKLY"}
              onClick={() => setPeriod("WEEKLY")}
            >
              Weekly
            </PeriodBtn>
            <PeriodBtn
              $active={period === "MONTHLY"}
              onClick={() => setPeriod("MONTHLY")}
            >
              Monthly
            </PeriodBtn>
          </ButtonGroup>
          <RefreshBtn onClick={fetchData}>
            <FaSync className={loading ? "spin" : ""} />
          </RefreshBtn>
          <ExportBtn>
            <FaDownload /> Report
          </ExportBtn>
        </ControlGroup>
      </Header>

      {/* 2. KPI 요약 카드 */}
      <SummaryGrid>
        <SummaryCard>
          <IconWrapper $color="#2ecc71">
            <FaPercentage />
          </IconWrapper>
          <CardContent>
            <Label>Final Yield (Avg)</Label>
            <BigValue>{kpiData.summary.avgYield}%</BigValue>
            <SubValue>Target: {kpiData.summary.yieldTarget}%</SubValue>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <IconWrapper $color="#3498db">
            <FaIndustry />
          </IconWrapper>
          <CardContent>
            <Label>Total Output</Label>
            <BigValue>{kpiData.summary.totalOutput.toLocaleString()}</BigValue>
            <SubValue>Wafer / Week</SubValue>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <IconWrapper $color="#e67e22">
            <FaStopwatch />
          </IconWrapper>
          <CardContent>
            <Label>Fab Cycle Time</Label>
            <BigValue>{kpiData.summary.cycleTime}</BigValue>
            <SubValue>Days (Avg)</SubValue>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <IconWrapper $color="#9b59b6">
            <FaChartLine />
          </IconWrapper>
          <CardContent>
            <Label>Overall OEE</Label>
            <BigValue>{kpiData.summary.avgOee}%</BigValue>
            <SubValue>Equipment Efficiency</SubValue>
          </CardContent>
        </SummaryCard>
      </SummaryGrid>

      {/* 3. 차트 섹션 */}
      <ChartGrid>
        {/* A. 수율 트렌드 (Line Chart) */}
        <ChartCard className="wide">
          <CardHeader>
            <CardTitle>Yield Trend (Prime vs Final)</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={kpiData.yieldTrend}
              margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="date" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="prime"
                name="Prime Yield"
                fill="#dcedc8"
                stroke="#8bc34a"
              />
              <Line
                type="monotone"
                dataKey="final"
                name="Final Yield (w/ Repair)"
                stroke="#1a4f8b"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#e74c3c"
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* B. Bin Loss Pareto (Bar Chart) */}
        <ChartCard>
          <CardHeader>
            <CardTitle>EDS Bin Loss Analysis</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={kpiData.binLoss}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" />
              <Tooltip />
              <Bar
                dataKey="count"
                name="Defect Count"
                fill="#ff7043"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* C. 설비 OEE 분석 (Multi Bar) */}
        <ChartCard className="wide">
          <CardHeader>
            <CardTitle>Equipment OEE Breakdown</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={kpiData.equipmentOee}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="group" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="availability" name="Availability" fill="#42a5f5" />
              <Bar dataKey="performance" name="Performance" fill="#66bb6a" />
              <Bar dataKey="quality" name="Quality" fill="#ffa726" />
              <Line
                type="monotone"
                dataKey="oee"
                name="OEE Score"
                stroke="#333"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </Container>
  );
};

export default KpiPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;
const ButtonGroup = styled.div`
  display: flex;
  background: white;
  border-radius: 6px;
  border: 1px solid #ddd;
  overflow: hidden;
  margin-right: 10px;
`;
const PeriodBtn = styled.button`
  border: none;
  background: ${(props) => (props.$active ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$active ? "white" : "#555")};
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  &:hover {
    background: ${(props) => (props.$active ? "#133b6b" : "#f5f5f5")};
  }
`;

const RefreshBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #f5f5f5;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const ExportBtn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #2e7d32;
  color: white;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #1b5e20;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;
const SummaryCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
`;
const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;
const Label = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;
const BigValue = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: #333;
  line-height: 1;
  margin-bottom: 5px;
`;
const SubValue = styled.span`
  font-size: 12px;
  color: #666;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  .wide {
    grid-column: span 2;
  }
`;
const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;
const CardHeader = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;
const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 700;
`;
