// src/pages/dashboard/DashboardPage.js
import React from "react";
import styled from "styled-components";
import {
  FaChartLine,
  FaIndustry,
  FaExclamationCircle,
  FaCheckCircle,
  FaMicrochip,
  FaArrowUp,
  FaArrowDown,
  FaTools,
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
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from "recharts";

// --- Mock Data ---

// 1. 시간대별 Wafer Output 추이
const PRODUCTION_TREND = [
  { time: "06:00", plan: 400, actual: 380 },
  { time: "08:00", plan: 450, actual: 440 },
  { time: "10:00", plan: 500, actual: 510 }, // 초과 달성
  { time: "12:00", plan: 400, actual: 200 }, // 점심시간
  { time: "14:00", plan: 500, actual: 480 },
  { time: "16:00", plan: 500, actual: 495 },
  { time: "18:00", plan: 450, actual: 0 }, // 미래
];

// 2. 공정별 WIP(재공) 밸런스 (병목 확인용)
// Photo(노광) -> Etch(식각) -> Depo(증착) -> CMP(연마) -> Ion(주입)
const WIP_BALANCE = [
  { step: "Clean", count: 1200 },
  { step: "Photo", count: 2500 }, // 병목 발생 (높음)
  { step: "Etch", count: 1800 },
  { step: "Depo", count: 1500 },
  { step: "CMP", count: 800 },
  { step: "Implant", count: 600 },
  { step: "EDS", count: 2000 },
];

// 3. 실시간 설비 알람 로그
const RECENT_ALERTS = [
  {
    id: 1,
    time: "14:25",
    equip: "Photo-02",
    msg: "Focus Error (Overlay)",
    level: "CRITICAL",
  },
  {
    id: 2,
    time: "14:10",
    equip: "Etch-05",
    msg: "Chamber Gas Leak Detected",
    level: "CRITICAL",
  },
  {
    id: 3,
    time: "13:45",
    equip: "Depo-01",
    msg: "Thickness Low Limit",
    level: "WARN",
  },
  {
    id: 4,
    time: "13:15",
    equip: "CMP-03",
    msg: "Slurry Level Low",
    level: "WARN",
  },
];

const DashboardPage = () => {
  return (
    <Container>
      {/* 1. 상단 타이틀 및 날짜 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaIndustry /> Fab Monitoring Dashboard
          </PageTitle>
          <SubTitle>Line: DDR5-Fab-A | Shift: Day (06:00 ~ 14:00)</SubTitle>
        </TitleArea>
        <DateDisplay>
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </DateDisplay>
      </Header>

      {/* 2. KPI 요약 카드 (4개) */}
      <KpiSection>
        <KpiCard>
          <CardHeader>
            <IconBox $color="#1a4f8b">
              <FaMicrochip />
            </IconBox>
            <TrendBadge $up>
              <FaArrowUp /> 2.5%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            2,510 <small>wfrs</small>
          </KpiValue>
          <KpiLabel>Today's Wafer Out</KpiLabel>
          <ProgressBar $percent={92} $color="#1a4f8b" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#2ecc71">
              <FaCheckCircle />
            </IconBox>
            <TrendBadge $up>
              <FaArrowUp /> 0.8%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            94.8 <small>%</small>
          </KpiValue>
          <KpiLabel>Prime Yield (Avg)</KpiLabel>
          <ProgressBar $percent={94.8} $color="#2ecc71" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#f39c12">
              <FaTools />
            </IconBox>
            <TrendBadge $down>
              <FaArrowDown /> 1.2%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            88.5 <small>%</small>
          </KpiValue>
          <KpiLabel>Fab Utilization (OEE)</KpiLabel>
          <ProgressBar $percent={88.5} $color="#f39c12" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#e74c3c">
              <FaExclamationCircle />
            </IconBox>
            <span style={{ fontSize: 12, color: "#999" }}>Active Issues</span>
          </CardHeader>
          <KpiValue>
            4 <small>cases</small>
          </KpiValue>
          <KpiLabel>Equipment Trouble</KpiLabel>
          <ProgressBar $percent={30} $color="#e74c3c" />
        </KpiCard>
      </KpiSection>

      {/* 3. 메인 차트 섹션 (Split Layout) */}
      <MainChartSection>
        {/* 좌측: 생산량 추이 */}
        <ChartCard style={{ flex: 1.5 }}>
          <SectionHeader>
            <SectionTitle>Hourly Wafer Output Trend</SectionTitle>
            <LegendGroup>
              <LegendItem color="#e0e0e0">Plan</LegendItem>
              <LegendItem color="#1a4f8b">Actual</LegendItem>
            </LegendGroup>
          </SectionHeader>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={PRODUCTION_TREND}
              margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="plan"
                barSize={20}
                fill="#e0e0e0"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1a4f8b"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 우측: 공정별 WIP 밸런스 */}
        <ChartCard style={{ flex: 1 }}>
          <SectionHeader>
            <SectionTitle>WIP Balance (Bottleneck Check)</SectionTitle>
          </SectionHeader>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={WIP_BALANCE}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="step"
                type="category"
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" barSize={15} radius={[0, 4, 4, 0]}>
                {WIP_BALANCE.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 2000 ? "#e74c3c" : "#3498db"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <WipLegend>
            <small style={{ color: "#e74c3c" }}>● Overload ({">"}2000)</small>
            <small style={{ color: "#3498db" }}>● Normal</small>
          </WipLegend>
        </ChartCard>
      </MainChartSection>

      {/* 4. 하단 알람 로그 섹션 */}
      <BottomSection>
        <SectionHeader>
          <SectionTitle>
            <FaExclamationCircle color="#e74c3c" /> Real-time Equipment Alerts
          </SectionTitle>
        </SectionHeader>
        <AlertTable>
          <thead>
            <tr>
              <th width="10%">Time</th>
              <th width="15%">Equipment ID</th>
              <th width="10%">Level</th>
              <th>Message</th>
              <th width="10%">Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ALERTS.map((alert) => (
              <tr key={alert.id}>
                <td style={{ color: "#666" }}>{alert.time}</td>
                <td style={{ fontWeight: "bold" }}>{alert.equip}</td>
                <td>
                  <AlertBadge $level={alert.level}>{alert.level}</AlertBadge>
                </td>
                <td>{alert.msg}</td>
                <td>
                  <ActionBtn>Ack</ActionBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </AlertTable>
      </BottomSection>
    </Container>
  );
};

export default DashboardPage;

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
  align-items: flex-end;
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
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  margin-left: 34px;
`;
const DateDisplay = styled.div`
  font-size: 14px;
  color: #555;
  font-weight: 600;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

// KPI Cards
const KpiSection = styled.div`
  display: flex;
  gap: 20px;
`;
const KpiCard = styled.div`
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;
const IconBox = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background-color: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;
const TrendBadge = styled.div`
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
  color: ${(props) => (props.$up ? "#2ecc71" : "#e74c3c")};
  background: ${(props) => (props.$up ? "#e8f5e9" : "#ffebee")};
  padding: 4px 8px;
  border-radius: 12px;
`;
const KpiValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #333;
  small {
    font-size: 14px;
    color: #888;
    font-weight: 500;
    margin-left: 5px;
  }
`;
const KpiLabel = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${(props) => props.$percent}%;
    background-color: ${(props) => props.$color};
  }
`;

// Chart Section
const MainChartSection = styled.div`
  display: flex;
  gap: 20px;
  height: 350px;
`;
const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const LegendGroup = styled.div`
  display: flex;
  gap: 15px;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  &::before {
    content: "";
    width: 10px;
    height: 10px;
    background-color: ${(props) => props.color};
    border-radius: 50%;
  }
`;
const WipLegend = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
`;

// Bottom Alert Section
const BottomSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;
const AlertTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th {
    text-align: left;
    padding: 12px;
    background: #f9f9f9;
    color: #666;
    border-bottom: 1px solid #eee;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
  }
`;
const AlertBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$level === "CRITICAL" ? "#ffebee" : "#fff3e0"};
  color: ${(props) => (props.$level === "CRITICAL" ? "#c62828" : "#e67e22")};
`;
const ActionBtn = styled.button`
  border: 1px solid #ddd;
  background: white;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
  }
`;
