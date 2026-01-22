// src/pages/quality/SpcChartPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from "recharts";
import {
  FaChartLine,
  FaFilter,
  FaExclamationCircle,
  FaCalculator,
} from "react-icons/fa";

// --- Custom Dot for Chart ---
const CustomDot = (props) => {
  const { cx, cy, value, ucl, lcl } = props;
  const isOOC = value > ucl || value < lcl;

  if (!cx || !cy) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={isOOC ? 6 : 4}
      stroke={isOOC ? "#c0392b" : "#3498db"}
      strokeWidth={2}
      fill={isOOC ? "#e74c3c" : "white"}
    />
  );
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Component
const SpcHeader = React.memo(
  ({ parameters, selectedParamId, onParamChange }) => {
    return (
      <Header>
        <TitleGroup>
          <FaChartLine size={24} color="#3498db" />
          <h1>SPC Monitoring</h1>
        </TitleGroup>
        <Controls>
          <FilterLabel>
            <FaFilter /> Parameter:
          </FilterLabel>
          <Select value={selectedParamId} onChange={onParamChange}>
            {parameters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.step})
              </option>
            ))}
          </Select>
        </Controls>
      </Header>
    );
  },
);

// 2. Chart Panel Component
const SpcChartPanel = React.memo(({ chartData, currentParam }) => {
  return (
    <ChartPanel>
      <PanelHeader>
        <h3>X-bar Control Chart</h3>
        <UnitBadge>Unit: {currentParam.unit}</UnitBadge>
      </PanelHeader>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />

            {/* Control Limits */}
            <ReferenceLine
              y={currentParam.ucl}
              label="UCL"
              stroke="#e74c3c"
              strokeDasharray="5 5"
            />
            <ReferenceLine
              y={currentParam.target}
              label="Target"
              stroke="#2ecc71"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={currentParam.lcl}
              label="LCL"
              stroke="#e74c3c"
              strokeDasharray="5 5"
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3498db"
              strokeWidth={2}
              dot={<CustomDot ucl={currentParam.ucl} lcl={currentParam.lcl} />}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartPanel>
  );
});

// 3. Stat Panel Component
const SpcStatPanel = React.memo(({ stats, violations }) => {
  return (
    <SidePanel>
      <StatCard>
        <CardTitle>
          <FaCalculator /> Process Capability
        </CardTitle>
        <StatGrid>
          <StatItem>
            <Label>Cpk</Label>
            <Value $good={stats.cpk >= 1.33}>{stats.cpk}</Value>
          </StatItem>
          <StatItem>
            <Label>Cp</Label>
            <Value $good={stats.cp >= 1.33}>{stats.cp}</Value>
          </StatItem>
          <StatItem>
            <Label>Mean</Label>
            <Value>{stats.mean}</Value>
          </StatItem>
          <StatItem>
            <Label>Std Dev</Label>
            <Value>{stats.stdDev}</Value>
          </StatItem>
        </StatGrid>
      </StatCard>

      <AlertCard>
        <CardTitle>
          <FaExclamationCircle /> OOC Alerts ({violations.length})
        </CardTitle>
        <AlertList>
          {violations.length > 0 ? (
            violations.map((v) => (
              <AlertItem key={v.id}>
                <AlertIcon>!</AlertIcon>
                <AlertText>
                  <div className="lot">{v.lotId}</div>
                  <div className="desc">Value {v.value} (Limit Exceeded)</div>
                </AlertText>
                <AlertTime>{v.time}</AlertTime>
              </AlertItem>
            ))
          ) : (
            <EmptyAlert>No OOC detected.</EmptyAlert>
          )}
        </AlertList>
      </AlertCard>
    </SidePanel>
  );
});

// --- Main Component ---

const SpcChartPage = () => {
  // --- State ---
  const [parameters, setParameters] = useState([]);
  const [selectedParamId, setSelectedParamId] = useState("");
  const [allData, setAllData] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:3001";
        const [paramRes, dataRes] = await Promise.all([
          fetch(`${baseUrl}/spcParameters`),
          fetch(`${baseUrl}/spcData`),
        ]);

        const params = await paramRes.json();
        const data = await dataRes.json();

        setParameters(params);
        setAllData(data);
        if (params.length > 0) setSelectedParamId(params[0].id);
      } catch (error) {
        console.error("Failed to fetch SPC data", error);
      }
    };
    fetchData();
  }, []);

  // --- Handlers (useCallback) ---
  const handleParamChange = useCallback((e) => {
    setSelectedParamId(e.target.value);
  }, []);

  // --- Derived State (useMemo) ---
  const currentParam = useMemo(
    () => parameters.find((p) => p.id === selectedParamId) || {},
    [parameters, selectedParamId],
  );

  const chartData = useMemo(() => {
    return allData.filter((d) => d.paramId === selectedParamId);
  }, [allData, selectedParamId]);

  // SPC Statistics Calculation
  const stats = useMemo(() => {
    if (chartData.length === 0 || !currentParam.ucl)
      return { mean: 0, stdDev: 0, cp: 0, cpk: 0 };

    const values = chartData.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    // Standard Deviation (Sample)
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      (values.length - 1);
    const stdDev = Math.sqrt(variance);

    // Cp, Cpk
    const { ucl, lcl } = currentParam;
    const cp = (ucl - lcl) / (6 * stdDev);
    const cpu = (ucl - mean) / (3 * stdDev);
    const cpl = (mean - lcl) / (3 * stdDev);
    const cpk = Math.min(cpu, cpl);

    return {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      cp: cp.toFixed(2),
      cpk: cpk.toFixed(2),
    };
  }, [chartData, currentParam]);

  // Violation Check
  const violations = useMemo(() => {
    return chartData.filter(
      (d) => d.value > currentParam.ucl || d.value < currentParam.lcl,
    );
  }, [chartData, currentParam]);

  return (
    <Container>
      {/* Header (Memoized) */}
      <SpcHeader
        parameters={parameters}
        selectedParamId={selectedParamId}
        onParamChange={handleParamChange}
      />

      <ContentRow>
        {/* Left: Chart Area (Memoized) */}
        <SpcChartPanel chartData={chartData} currentParam={currentParam} />

        {/* Right: Stats & Alerts (Memoized) */}
        <SpcStatPanel stats={stats} violations={violations} />
      </ContentRow>
    </Container>
  );
};

export default SpcChartPage;

// --- Styled Components (No Changes) ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h1 {
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterLabel = styled.span`
  font-size: 14px;
  color: #666;
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  min-width: 200px;
`;

// 2. 메인 콘텐츠 영역: 남은 높이 모두 차지
const ContentRow = styled.div`
  display: flex;
  gap: 20px;
  flex: 1; /* 헤더 제외 남은 공간 채움 */
  overflow: hidden; /* 내부 스크롤 제어 */
  min-height: 0; /* Flex 자식의 스크롤버그 방지 */
`;

const ChartPanel = styled.div`
  flex: 3;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 차트 넘침 방지 */
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
`;

const UnitBadge = styled.span`
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 0; /* 중요: 부모 높이에 맞춰 차트 리사이징 */
  width: 100%;
`;

const SidePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px; /* 패널 최소 너비 확보 */
  overflow: hidden;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0; /* 통계 카드는 줄어들지 않음 */
`;

const CardTitle = styled.h4`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const StatItem = styled.div`
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
`;

const Label = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) =>
    props.$good === false
      ? "#e74c3c"
      : props.$good === true
        ? "#2ecc71"
        : "#2c3e50"};
`;

// 3. 알림 카드: 남은 공간 차지 + 내부 스크롤
const AlertCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex: 1; /* 남은 세로 공간 모두 차지 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 리스트 스크롤을 위해 숨김 */
  min-height: 0;
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto; /* 목록이 길어지면 여기서 스크롤 */
  flex: 1;
  padding-right: 5px; /* 스크롤바 여백 */

  /* 스크롤바 스타일링 (선택 사항) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff5f5;
  border-left: 3px solid #e74c3c;
  border-radius: 4px;
  flex-shrink: 0; /* 리스트 아이템 찌그러짐 방지 */
`;

const AlertIcon = styled.div`
  width: 20px;
  height: 20px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
`;

const AlertText = styled.div`
  flex: 1;
  .lot {
    font-weight: bold;
    font-size: 13px;
    color: #c0392b;
  }
  .desc {
    font-size: 12px;
    color: #555;
  }
`;

const AlertTime = styled.div`
  font-size: 11px;
  color: #999;
  white-space: nowrap;
`;

const EmptyAlert = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 20px 0;
`;
