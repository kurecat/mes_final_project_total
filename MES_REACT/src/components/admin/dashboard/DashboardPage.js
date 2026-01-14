// src/pages/DashboardPage.js
import React from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaIndustry,
  FaTools,
  FaExclamationTriangle,
  FaUserClock,
} from "react-icons/fa";

// --- Mock Data ---
const PRODUCTION_DATA = [
  { time: "09:00", target: 100, actual: 95 },
  { time: "10:00", target: 100, actual: 102 },
  { time: "11:00", target: 100, actual: 98 },
  { time: "12:00", target: 100, actual: 40 },
  { time: "13:00", target: 100, actual: 99 },
  { time: "14:00", target: 100, actual: 85 },
  { time: "15:00", target: 100, actual: 0 },
];

const MACHINE_STATUS_DATA = [
  { name: "Running", value: 8, color: "#4caf50" },
  { name: "Idle", value: 2, color: "#ff9800" },
  { name: "Error", value: 1, color: "#f44336" },
  { name: "Off", value: 1, color: "#9e9e9e" },
];

const ERROR_LOGS = [
  {
    id: 1,
    time: "14:10:23",
    machine: "MC-03",
    message: "온도 센서 과열 감지",
    level: "Critical",
  },
  {
    id: 2,
    time: "13:45:11",
    machine: "MC-01",
    message: "자재 공급 지연",
    level: "Warning",
  },
  {
    id: 3,
    time: "11:20:05",
    machine: "MC-05",
    message: "도어 열림 감지",
    level: "Warning",
  },
  {
    id: 4,
    time: "10:05:22",
    machine: "MC-02",
    message: "네트워크 통신 오류",
    level: "Critical",
  },
];

const DashboardPage = () => {
  return (
    <Container>
      <HeaderSection>
        <PageTitle>Factory Monitoring Dashboard</PageTitle>
        <CurrentTime>2024-05-20 14:35:00 (Live)</CurrentTime>
      </HeaderSection>

      {/* 1. 상단 KPI 카드 영역 (높이 고정) */}
      <TopCardSection>
        <StatsCard
          title="일일 생산 달성률"
          value="87.5%"
          sub="목표 600 / 실적 519"
          icon={<FaIndustry />}
          color="#1a4f8b"
        />
        <StatsCard
          title="설비 가동률"
          value="75.0%"
          sub="가동 9 / 전체 12"
          icon={<FaTools />}
          color="#2e7d32"
        />
        <StatsCard
          title="금일 불량률"
          value="1.2%"
          sub="불량 6ea"
          icon={<FaExclamationTriangle />}
          color="#d32f2f"
        />
        <StatsCard
          title="작업자 투입"
          value="24명"
          sub="현재 근무 중"
          icon={<FaUserClock />}
          color="#f57c00"
        />
      </TopCardSection>

      {/* 2. 차트 영역 (남은 공간 채우기: flex 1) */}
      <MiddleChartSection>
        <ChartBox style={{ flex: 2 }}>
          {" "}
          {/* 왼쪽이 더 넓게 */}
          <ChartHeader>시간대별 생산 현황 (UPH)</ChartHeader>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={PRODUCTION_DATA}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="target"
                name="목표량"
                fill="#e0e0e0"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="actual"
                name="생산량"
                fill="#1a4f8b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox style={{ flex: 1 }}>
          <ChartHeader>설비 상태 모니터링</ChartHeader>
          <PieChartWrapper>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={MACHINE_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MACHINE_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <StatusLegend>
              {MACHINE_STATUS_DATA.map((item) => (
                <StatusItem key={item.name}>
                  <Dot color={item.color} />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </StatusItem>
              ))}
            </StatusLegend>
          </PieChartWrapper>
        </ChartBox>
      </MiddleChartSection>

      {/* 3. 하단 로그 영역 (높이 고정) */}
      <BottomLogSection>
        <ChartBox>
          <ChartHeader>실시간 이상 감지 (Real-time Alerts)</ChartHeader>
          <TableContainer>
            <LogTable>
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>발생 시간</th>
                  <th style={{ width: "15%" }}>설비명</th>
                  <th>알람 내용</th>
                  <th style={{ width: "10%" }}>등급</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td>{log.time}</td>
                    <td>{log.machine}</td>
                    <td>{log.message}</td>
                    <td>
                      <LevelBadge $level={log.level}>{log.level}</LevelBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </LogTable>
          </TableContainer>
        </ChartBox>
      </BottomLogSection>
    </Container>
  );
};

// --- Sub Component ---
const StatsCard = ({ title, value, sub, icon, color }) => (
  <Card>
    <CardInfo>
      <CardTitle>{title}</CardTitle>
      <CardValue color={color}>{value}</CardValue>
      <CardSub>{sub}</CardSub>
    </CardInfo>
    <IconCircle color={color}>{icon}</IconCircle>
  </Card>
);

export default DashboardPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%; /* 부모(ContentArea)를 꽉 채움 */
  display: flex;
  flex-direction: column;
  gap: 15px; /* 각 섹션 간 간격 */
  /* padding은 ContentArea에서 이미 20px을 주었으므로 여기선 제거 */
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 40px; /* 헤더 높이 고정 */
  flex-shrink: 0;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const CurrentTime = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

// 1. 상단 카드 영역
const TopCardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 1920px이므로 4개 가로 배치 */
  gap: 15px;
  height: 120px; /* 높이 고정 */
  flex-shrink: 0; /* 줄어들지 않음 */
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
`;

const CardValue = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: ${(props) => props.color};
  margin-bottom: 4px;
`;

const CardSub = styled.div`
  font-size: 12px;
  color: #666;
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${(props) => (props.color ? `${props.color}15` : "#eee")};
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
`;

// 2. 중간 차트 영역 (가변 높이)
const MiddleChartSection = styled.div`
  display: flex;
  gap: 15px;
  flex: 1; /* 남은 세로 공간 모두 차지 */
  min-height: 300px; /* 최소 높이 보장 */
`;

const ChartBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const ChartHeader = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #444;
  margin: 0 0 15px 0;
`;

const PieChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StatusLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  width: 100%;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #555;

  strong {
    margin-left: 5px;
    font-size: 14px;
  }
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 6px;
`;

// 3. 하단 로그 영역 (높이 고정)
const BottomLogSection = styled.div`
  height: 250px; /* 높이 고정 */
  flex-shrink: 0;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto; /* 내용 넘치면 스크롤 */

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 10px;
    background-color: #f9fafb;
    color: #555;
    position: sticky;
    top: 0;
    border-bottom: 1px solid #eee;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
  }
`;

const LevelBadge = styled.span`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$level === "Critical" ? "#ffebee" : "#fff3e0"};
  color: ${(props) => (props.$level === "Critical" ? "#c62828" : "#ef6c00")};
`;
