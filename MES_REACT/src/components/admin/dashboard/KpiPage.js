// src/pages/dashboard/KpiPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  FaChartPie,
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

// --- Mock Data Variants (Base Data) ---
const MOCK_DATA_VARIANTS = {
  DAILY: {
    summary: {
      avgYield: 95.2,
      yieldTarget: 96.0,
      totalOutput: 2100,
      cycleTime: 44.5,
      avgOee: 89.5,
    },
    yieldTrend: [
      { date: "09:00", prime: 92, final: 95, target: 96 },
      { date: "11:00", prime: 91, final: 94, target: 96 },
      { date: "13:00", prime: 93, final: 96, target: 96 },
      { date: "15:00", prime: 94, final: 97, target: 96 },
      { date: "17:00", prime: 92, final: 95, target: 96 },
      { date: "19:00", prime: 95, final: 98, target: 96 },
    ],
    binLoss: [
      { type: "Single Bit", count: 150, desc: "Repairable" },
      { type: "Multi Bit", count: 120, desc: "Non-Repair" },
      { type: "Open/Short", count: 80, desc: "Hard Fail" },
      { type: "Func Fail", count: 60, desc: "Logic Error" },
      { type: "Leakage", count: 40, desc: "Power Spec" },
    ],
    equipmentOee: [
      {
        group: "Photo",
        availability: 96,
        performance: 93,
        quality: 99,
        oee: 88,
      },
      {
        group: "Etch",
        availability: 91,
        performance: 89,
        quality: 98,
        oee: 79,
      },
      {
        group: "Depo",
        availability: 93,
        performance: 96,
        quality: 99,
        oee: 88,
      },
      { group: "CMP", availability: 87, performance: 91, quality: 97, oee: 76 },
    ],
  },
  WEEKLY: {
    summary: {
      avgYield: 94.5,
      yieldTarget: 96.0,
      totalOutput: 15400,
      cycleTime: 45.2,
      avgOee: 88.2,
    },
    yieldTrend: [
      { date: "Mon", prime: 88.5, final: 93.2, target: 96 },
      { date: "Tue", prime: 89.1, final: 93.8, target: 96 },
      { date: "Wed", prime: 88.0, final: 92.5, target: 96 },
      { date: "Thu", prime: 90.2, final: 94.5, target: 96 },
      { date: "Fri", prime: 91.5, final: 95.8, target: 96 },
      { date: "Sat", prime: 92.0, final: 96.2, target: 96 },
      { date: "Sun", prime: 93.0, final: 96.5, target: 96 },
    ],
    binLoss: [
      { type: "Single Bit", count: 1250, desc: "Repairable" },
      { type: "Multi Bit", count: 850, desc: "Non-Repair" },
      { type: "Open/Short", count: 620, desc: "Hard Fail" },
      { type: "Func Fail", count: 450, desc: "Logic Error" },
      { type: "Leakage", count: 300, desc: "Power Spec" },
    ],
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
      {
        group: "CMP",
        availability: 85,
        performance: 90,
        quality: 97,
        oee: 74.2,
      },
    ],
  },
  MONTHLY: {
    summary: {
      avgYield: 93.8,
      yieldTarget: 96.0,
      totalOutput: 62000,
      cycleTime: 46.1,
      avgOee: 87.5,
    },
    yieldTrend: [
      { date: "Week 1", prime: 87.5, final: 92.0, target: 96 },
      { date: "Week 2", prime: 88.2, final: 93.5, target: 96 },
      { date: "Week 3", prime: 90.5, final: 94.8, target: 96 },
      { date: "Week 4", prime: 92.1, final: 96.0, target: 96 },
    ],
    binLoss: [
      { type: "Single Bit", count: 5200, desc: "Repairable" },
      { type: "Multi Bit", count: 3100, desc: "Non-Repair" },
      { type: "Open/Short", count: 2400, desc: "Hard Fail" },
      { type: "Func Fail", count: 1800, desc: "Logic Error" },
      { type: "Leakage", count: 1200, desc: "Power Spec" },
    ],
    equipmentOee: [
      {
        group: "Photo",
        availability: 94,
        performance: 91,
        quality: 99,
        oee: 85,
      },
      {
        group: "Etch",
        availability: 89,
        performance: 87,
        quality: 98,
        oee: 76,
      },
      {
        group: "Depo",
        availability: 91,
        performance: 94,
        quality: 99,
        oee: 85,
      },
      { group: "CMP", availability: 84, performance: 89, quality: 97, oee: 73 },
    ],
  },
};

// --- Sub-Components ---

const SummaryBoard = React.memo(({ summary }) => {
  return (
    <SummaryGrid>
      <SummaryCard>
        <IconWrapper $color="#2ecc71">
          <FaPercentage />
        </IconWrapper>
        <CardContent>
          <Label>Final Yield (Avg)</Label>
          <BigValue>{summary.avgYield}%</BigValue>
          <SubValue>Target: {summary.yieldTarget}%</SubValue>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <IconWrapper $color="#3498db">
          <FaIndustry />
        </IconWrapper>
        <CardContent>
          <Label>Total Output</Label>
          <BigValue>{summary.totalOutput.toLocaleString()}</BigValue>
          <SubValue>Wafer / Period</SubValue>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <IconWrapper $color="#e67e22">
          <FaStopwatch />
        </IconWrapper>
        <CardContent>
          <Label>Fab Cycle Time</Label>
          <BigValue>{summary.cycleTime}</BigValue>
          <SubValue>Days (Avg)</SubValue>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <IconWrapper $color="#9b59b6">
          <FaChartLine />
        </IconWrapper>
        <CardContent>
          <Label>Overall OEE</Label>
          <BigValue>{summary.avgOee}%</BigValue>
          <SubValue>Equipment Efficiency</SubValue>
        </CardContent>
      </SummaryCard>
    </SummaryGrid>
  );
});

const YieldTrendChart = React.memo(({ data }) => {
  return (
    <ChartCard className="wide">
      <CardHeader>
        <CardTitle>Yield Trend (Prime vs Final)</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
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
  );
});

const OeeBreakdownChart = React.memo(({ data }) => {
  return (
    <ChartCard className="wide">
      <CardHeader>
        <CardTitle>Equipment OEE Breakdown</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="group"
            tick={{ fontSize: 12, fill: "#666" }}
            dy={10}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />

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
  );
});

const BinLossAnalysisChart = React.memo(({ data }) => {
  return (
    <ChartCard>
      <CardHeader>
        <CardTitle>EDS Bin Loss Analysis</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
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
  );
});

// --- Main Component ---

const KpiPage = () => {
  const [kpiData, setKpiData] = useState(MOCK_DATA_VARIANTS.WEEKLY);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("WEEKLY");

  // [기능 추가] 랜덤 데이터 생성 유틸리티
  // 새로고침 시 데이터가 변하는 느낌을 주기 위해 미세한 변동을 줍니다.
  const randomizeData = (baseData) => {
    // 1. Summary 랜덤 변동 (± 값)
    const randomYield = +(
      baseData.summary.avgYield +
      (Math.random() * 2 - 1)
    ).toFixed(1);
    const randomOutput = Math.floor(
      baseData.summary.totalOutput + (Math.random() * 200 - 100),
    );

    // 2. Trend 차트 랜덤 변동
    const randomTrend = baseData.yieldTrend.map((item) => ({
      ...item,
      prime: +(item.prime + (Math.random() * 2 - 1)).toFixed(1),
      final: +(item.final + (Math.random() * 1 - 0.5)).toFixed(1),
    }));

    return {
      ...baseData,
      summary: {
        ...baseData.summary,
        avgYield: randomYield,
        totalOutput: randomOutput,
      },
      yieldTrend: randomTrend,
    };
  };

  // [수정] fetchData에 랜덤 로직 적용
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션 (0.6초 딜레이)
      setTimeout(() => {
        const baseData = MOCK_DATA_VARIANTS[period];
        const newData = randomizeData(baseData); // 데이터 변동 적용

        setKpiData(newData);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Report 다운로드
  const handleDownloadReport = () => {
    if (!kpiData || !kpiData.yieldTrend) {
      alert("No data to export.");
      return;
    }
    const headers = Object.keys(kpiData.yieldTrend[0]).join(",");
    const rows = kpiData.yieldTrend
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `KPI_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summaryData = useMemo(() => kpiData.summary, [kpiData.summary]);
  const yieldData = useMemo(() => kpiData.yieldTrend, [kpiData.yieldTrend]);
  const oeeData = useMemo(() => kpiData.equipmentOee, [kpiData.equipmentOee]);
  const binLossData = useMemo(() => kpiData.binLoss, [kpiData.binLoss]);

  return (
    <Container>
      {/* 1. Header Control */}
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

          {/* 새로고침 버튼 */}
          <RefreshBtn onClick={fetchData} title="Refresh Data">
            <FaSync className={loading ? "spin" : ""} />
          </RefreshBtn>

          <ExportBtn onClick={handleDownloadReport}>
            <FaDownload /> Report
          </ExportBtn>
        </ControlGroup>
      </Header>

      {/* 2. Summary Section */}
      <SummaryBoard summary={summaryData} />

      {/* 3. Chart Section */}
      <ChartGrid>
        <YieldTrendChart data={yieldData} />
        <OeeBreakdownChart data={oeeData} />
        <BinLossAnalysisChart data={binLossData} />
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
  padding-bottom: 100px;
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
  transition: all 0.2s;
  &:hover {
    background: #f5f5f5;
    color: #1a4f8b;
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
