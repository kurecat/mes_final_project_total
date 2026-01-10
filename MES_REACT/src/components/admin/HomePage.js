import React from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaIndustry,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import { FaMicrochip } from "react-icons/fa6";

// --- Mock Data (HBM 공정 관련 가상 데이터) ---

// 1. KPI 데이터
const KPI_DATA = [
  {
    title: "종합 수율 (Total Yield)",
    value: "92.4%",
    change: "+1.2%",
    status: "good",
    icon: <FaCheckCircle />,
  },
  {
    title: "시간당 생산 (UPH)",
    value: "1,240 ea",
    change: "-50 ea",
    status: "bad",
    icon: <FaMicrochip />,
  },
  {
    title: "설비 가동률 (Utilization)",
    value: "98.5%",
    change: "stable",
    status: "neutral",
    icon: <FaIndustry />,
  },
  {
    title: "불량률 (Defect Rate)",
    value: "0.45%",
    change: "-0.02%",
    status: "good",
    icon: <FaExclamationTriangle />,
  },
];

// 2. 시간대별 생산 현황 (Stacking 공정 기준)
const PRODUCTION_DATA = [
  { time: "09:00", target: 1200, actual: 1150 },
  { time: "10:00", target: 1200, actual: 1210 },
  { time: "11:00", target: 1200, actual: 1180 },
  { time: "12:00", target: 1200, actual: 1240 },
  { time: "13:00", target: 1200, actual: 1190 },
  { time: "14:00", target: 1200, actual: 1250 },
  { time: "15:00", target: 1200, actual: 1300 },
];

// 3. 불량 유형 파레토 (HBM 주요 불량)
const DEFECT_DATA = [
  { name: "TSV Open", count: 45 },
  { name: "Chip Crack", count: 32 },
  { name: "Underfill Void", count: 28 },
  { name: "Bump Short", count: 15 },
  { name: "Misalign", count: 10 },
];

// 4. 설비 가동 현황
const EQUIP_STATUS_DATA = [
  { name: "Run", value: 42 },
  { name: "Idle", value: 5 },
  { name: "Down", value: 3 },
];
const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

// --- Component ---

const Homepage = () => {
  return (
    <Container>
      <TitleArea>
        <h2>HBM Line Dashboard</h2>
        <span>Real-time Monitoring System</span>
      </TitleArea>

      {/* 1. 상단 KPI 카드 영역 */}
      <KpiGrid>
        {KPI_DATA.map((kpi, index) => (
          <KpiCard key={index}>
            <CardHeader>
              <IconBox $status={kpi.status}>{kpi.icon}</IconBox>
              <KpiTitle>{kpi.title}</KpiTitle>
            </CardHeader>
            <KpiValue>{kpi.value}</KpiValue>
            <KpiChange $status={kpi.status}>
              {kpi.change === "stable" ? "-" : kpi.change}
              {kpi.change !== "stable" && <span> vs yesterday</span>}
            </KpiChange>
          </KpiCard>
        ))}
      </KpiGrid>

      {/* 2. 메인 차트 그리드 영역 */}
      <MainGrid>
        {/* 좌측 상단: 생산 트렌드 */}
        <ChartCard $colSpan="2">
          <CardTitle>
            실시간 적층 공정 생산량 (Stacking Process Trend)
          </CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={PRODUCTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#8884d8"
                name="Target (목표)"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1a4f8b"
                name="Actual (실적)"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 우측 상단: 설비 가동 현황 */}
        <ChartCard>
          <CardTitle>설비 가동 현황 (Equipment Status)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={EQUIP_STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {EQUIP_STATUS_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 하단: 불량 유형 분석 */}
        <ChartCard $colSpan="3">
          <CardTitle>주요 불량 유형 분석 (Defect Pareto)</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={DEFECT_DATA}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="count"
                fill="#d9534f"
                barSize={20}
                radius={[0, 10, 10, 0]}
                name="Defect Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </MainGrid>
    </Container>
  );
};

export default Homepage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;

  /* 헤더(100px) + 여유분(5px) = 105px 뺌 */
  height: 100%;

  background-color: #f5f6fa;
  padding: 30px;
  box-sizing: border-box;
  overflow-y: auto; /* 내부 스크롤만 허용 */

  /* 스크롤바 디자인 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;

const TitleArea = styled.div`
  margin-bottom: 25px;
  h2 {
    margin: 0;
    font-size: 24px;
    color: #2c3e50;
  }
  span {
    font-size: 14px;
    color: #7f8c8d;
  }
`;

// KPI Grid System
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;

  /* 화면이 작아지면 카드를 2열, 더 작아지면 1열로 바꿈 */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  /* 2. 글자 잘림 해결: 고정 높이 제거하고 최소 높이 설정 + 간격 균등 분배 */
  min-height: 130px;
  justify-content: space-between;

  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0; /* 아이콘 찌그러짐 방지 */

  background-color: ${(props) =>
    props.$status === "good"
      ? "#e8f5e9"
      : props.$status === "bad"
      ? "#ffebee"
      : "#e3f2fd"};
  color: ${(props) =>
    props.$status === "good"
      ? "#2e7d32"
      : props.$status === "bad"
      ? "#c62828"
      : "#1565c0"};
`;

const KpiTitle = styled.span`
  font-size: 14px;
  color: #888;
  font-weight: 600;
  /* 제목이 길어지면 줄바꿈 허용 */
  white-space: normal;
  line-height: 1.2;
`;

const KpiValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #333;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const KpiChange = styled.div`
  font-size: 13px; /* 글자 크기 약간 키움 */
  font-weight: 600;
  color: ${(props) =>
    props.$status === "good"
      ? "#2e7d32"
      : props.$status === "bad"
      ? "#c62828"
      : "#7f8c8d"};

  span {
    color: #aaa;
    font-weight: 400;
    margin-left: 5px;
  }
`;

// Main Chart Grid System
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-bottom: 20px; /* 하단 여백 추가 (스크롤 끝부분 잘림 방지) */

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  /* 반응형 Grid 적용 */
  grid-column: span ${(props) => props.$colSpan || 1};

  display: flex;
  flex-direction: column;

  @media (max-width: 1000px) {
    grid-column: span 1; /* 화면 작아지면 한 줄에 하나씩 */
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #444;
  font-weight: 700;
`;
