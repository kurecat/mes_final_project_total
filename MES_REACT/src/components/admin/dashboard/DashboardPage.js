// src/pages/dashboard/DashboardPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios"; // API 호출용
import {
  FaChartLine,
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
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- Fallback Mock Data (서버 연결 실패 시 보여줄 기본 데이터) ---
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
    { step: "Photo", count: 2600 }, // 병목 (Overload)
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
  ],
};

const DashboardPage = () => {
  // 상태 관리
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 데이터 가져오기 (json-server 연동)
  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 사용 시: http://localhost:3001/dashboardData
      // 현재는 db.json 구조에 따라 엔드포인트를 맞춰야 함
      // 여기서는 예시로 MOCK 데이터를 그대로 씀 (서버 연결 시 axios.get 사용)

      // const res = await axios.get("http://localhost:3001/dashboard");
      // setData(res.data);

      // (테스트용) 0.5초 딜레이 후 Mock Data 세팅
      setTimeout(() => {
        setData(MOCK_DATA);
        setLastUpdated(new Date());
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error);
      // 에러 시 기존 Mock Data 유지
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 30초마다 자동 갱신 (실시간 모니터링 느낌)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Container>
      {/* 1. 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaIndustry /> Fab Monitoring Dashboard
            {loading && (
              <LoadingSpinner>
                <FaSync className="spin" />
              </LoadingSpinner>
            )}
          </PageTitle>
          <SubTitle>Line: DDR5-Fab-A | Shift: Day (06:00 ~ 14:00)</SubTitle>
        </TitleArea>
        <HeaderRight>
          <LastUpdate>Updated: {lastUpdated.toLocaleTimeString()}</LastUpdate>
          <RefreshBtn onClick={handleRefresh}>
            <FaSync /> Refresh
          </RefreshBtn>
        </HeaderRight>
      </Header>

      {/* 2. KPI 요약 카드 */}
      <KpiSection>
        <KpiCard>
          <CardHeader>
            <IconBox $color="#1a4f8b">
              <FaMicrochip />
            </IconBox>
            <TrendBadge $up={data.stats.waferOutTrend > 0}>
              {data.stats.waferOutTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(data.stats.waferOutTrend)}%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            {data.stats.waferOut.toLocaleString()} <small>wfrs</small>
          </KpiValue>
          <KpiLabel>Today's Wafer Out</KpiLabel>
          <ProgressBar $percent={92} $color="#1a4f8b" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#2ecc71">
              <FaCheckCircle />
            </IconBox>
            <TrendBadge $up={data.stats.yieldTrend > 0}>
              {data.stats.yieldTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(data.stats.yieldTrend)}%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            {data.stats.yield} <small>%</small>
          </KpiValue>
          <KpiLabel>Prime Yield (Avg)</KpiLabel>
          <ProgressBar $percent={data.stats.yield} $color="#2ecc71" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#f39c12">
              <FaTools />
            </IconBox>
            <TrendBadge
              $up={data.stats.utilizationTrend > 0}
              $down={data.stats.utilizationTrend < 0}
            >
              {data.stats.utilizationTrend > 0 ? (
                <FaArrowUp />
              ) : (
                <FaArrowDown />
              )}
              {Math.abs(data.stats.utilizationTrend)}%
            </TrendBadge>
          </CardHeader>
          <KpiValue>
            {data.stats.utilization} <small>%</small>
          </KpiValue>
          <KpiLabel>Fab Utilization (OEE)</KpiLabel>
          <ProgressBar $percent={data.stats.utilization} $color="#f39c12" />
        </KpiCard>

        <KpiCard>
          <CardHeader>
            <IconBox $color="#e74c3c">
              <FaExclamationCircle />
            </IconBox>
            <span
              style={{ fontSize: 12, color: "#e74c3c", fontWeight: "bold" }}
            >
              Action Req.
            </span>
          </CardHeader>
          <KpiValue>
            {data.stats.issues} <small>cases</small>
          </KpiValue>
          <KpiLabel>Equipment Trouble</KpiLabel>
          <ProgressBar
            $percent={(data.stats.issues / 10) * 100}
            $color="#e74c3c"
          />
        </KpiCard>
      </KpiSection>

      {/* 3. 차트 섹션 */}
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
              data={data.productionTrend}
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

        {/* 우측: WIP 밸런스 (병목 확인) */}
        <ChartCard style={{ flex: 1 }}>
          <SectionHeader>
            <SectionTitle>WIP Balance (Bottleneck)</SectionTitle>
          </SectionHeader>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.wipBalance}
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
                {data.wipBalance.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 2500 ? "#e74c3c" : "#3498db"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <WipLegend>
            <small style={{ color: "#e74c3c" }}>● Overload ({">"}2500)</small>
            <small style={{ color: "#3498db" }}>● Normal</small>
          </WipLegend>
        </ChartCard>
      </MainChartSection>

      {/* 4. 알람 리스트 */}
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
            {data.alerts.map((alert) => (
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
const LoadingSpinner = styled.span`
  font-size: 16px;
  color: #1a4f8b;
  margin-left: 10px;
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
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  margin-left: 34px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;
const LastUpdate = styled.span`
  font-size: 12px;
  color: #888;
`;
const RefreshBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-weight: 600;
  &:hover {
    background: #f5f5f5;
  }
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
  color: ${(props) =>
    props.$up ? "#2ecc71" : props.$down ? "#e74c3c" : "#f39c12"};
  background: ${(props) =>
    props.$up ? "#e8f5e9" : props.$down ? "#ffebee" : "#fff3e0"};
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
