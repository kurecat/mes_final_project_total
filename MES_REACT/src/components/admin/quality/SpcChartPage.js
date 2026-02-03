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

// ★ API 연결용
import axiosInstance from "../../../api/axios";

// --- Custom Dot for Chart ---
const CustomDot = (props) => {
  const { cx, cy, value, ucl, lcl } = props;
  // 상한(UCL) 초과 또는 하한(LCL) 미만일 경우 빨간점 표시
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

// --- Sub-Components ---

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
                {p.processName} - {p.checkItem}
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
        <UnitBadge>Unit: {currentParam.unit || "-"}</UnitBadge>
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

            {/* Control Limits (백엔드 데이터 기준) */}
            {currentParam.ucl && (
              <ReferenceLine
                y={currentParam.ucl}
                label="UCL"
                stroke="#e74c3c"
                strokeDasharray="5 5"
              />
            )}
            {/* Target Line (USL과 LSL의 중간값으로 계산하거나 DB값 사용) */}
            {currentParam.ucl && currentParam.lcl && (
              <ReferenceLine
                y={(currentParam.ucl + currentParam.lcl) / 2}
                label="Target"
                stroke="#2ecc71"
                strokeDasharray="3 3"
              />
            )}
            {currentParam.lcl && (
              <ReferenceLine
                y={currentParam.lcl}
                label="LCL"
                stroke="#e74c3c"
                strokeDasharray="5 5"
              />
            )}

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
            violations.map((v, idx) => (
              <AlertItem key={idx}>
                <AlertIcon>!</AlertIcon>
                <AlertText>
                  <div className="lot">{v.time}</div>
                  <div className="desc">Value {v.value} (Limit Exceeded)</div>
                </AlertText>
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
  const [rawLogs, setRawLogs] = useState([]); // 백엔드 원본 데이터

  // --- Data Fetching (API 연동) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 검사 기준(Parameter)과 측정 데이터(Log) 동시 조회
        const [stdRes, dataRes] = await Promise.all([
          axiosInstance.get("/api/mes/quality/standard"), // 기준 정보
          axiosInstance.get("/api/mes/quality/spc"), // DieBonding 데이터
        ]);

        const params = stdRes.data || [];
        const logs = dataRes.data || [];

        // DB 컬럼명 매핑 (Backend Entity Field -> Display Name)
        // 백엔드의 InspectionStandard.checkItem 값과 매칭됨
        const formattedParams = params.map((p) => ({
          id: p.id,
          processName: p.processName,
          checkItem: p.checkItem,
          ucl: p.usl, // DB의 USL을 차트의 UCL로 사용
          lcl: p.lsl, // DB의 LSL을 차트의 LCL로 사용
          unit: p.unit,
          // 어떤 Java 필드를 읽어야 하는지 매핑 정보 추가
          fieldKey:
            p.checkItem === "Bonding Temp" ? "bondingTemperature" : "unknown",
        }));

        setParameters(formattedParams);
        setRawLogs(logs);

        if (formattedParams.length > 0) {
          setSelectedParamId(formattedParams[0].id);
        }
      } catch (error) {
        console.error("SPC 데이터 조회 실패:", error);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---
  const handleParamChange = useCallback((e) => {
    setSelectedParamId(Number(e.target.value));
  }, []);

  // --- Derived State (Data Transformation) ---

  // 1. 현재 선택된 파라미터 정보
  const currentParam = useMemo(
    () => parameters.find((p) => p.id === selectedParamId) || {},
    [parameters, selectedParamId],
  );

  // 2. 차트 데이터 가공 (Entity -> Chart Point)
  const chartData = useMemo(() => {
    if (!currentParam.fieldKey) return [];

    // 현재는 DieBonding 데이터만 가져오므로, "Bonding Temp"일 때만 데이터 매핑
    // (WireBonding, Molding 데이터는 API 확장이 필요함)
    if (currentParam.checkItem !== "Bonding Temp") return [];

    return rawLogs.map((log) => ({
      time: log.productionLog?.startTime
        ? new Date(log.productionLog.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      value: log.bondingTemperature || 0, // 실제 측정값
      lotId: log.productionLog?.workOrder?.workOrderNumber || "Unknown",
    }));
  }, [rawLogs, currentParam]);

  // 3. 통계 계산 (Cp, Cpk, Mean, StdDev)
  const stats = useMemo(() => {
    if (chartData.length === 0 || !currentParam.ucl)
      return { mean: 0, stdDev: 0, cp: 0, cpk: 0 };

    const values = chartData.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    // 표준편차 (Sample StdDev)
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      (values.length - 1 || 1);
    const stdDev = Math.sqrt(variance);

    // Cp, Cpk 계산
    const { ucl, lcl } = currentParam;
    const cp = (ucl - lcl) / (6 * stdDev);
    const cpu = (ucl - mean) / (3 * stdDev);
    const cpl = (mean - lcl) / (3 * stdDev);
    const cpk = Math.min(cpu, cpl);

    return {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      cp: isFinite(cp) ? cp.toFixed(2) : 0,
      cpk: isFinite(cpk) ? cpk.toFixed(2) : 0,
    };
  }, [chartData, currentParam]);

  // 4. OOC(Out of Control) 위반 목록 추출
  const violations = useMemo(() => {
    if (!currentParam.ucl) return [];
    return chartData.filter(
      (d) => d.value > currentParam.ucl || d.value < currentParam.lcl,
    );
  }, [chartData, currentParam]);

  return (
    <Container>
      <SpcHeader
        parameters={parameters}
        selectedParamId={selectedParamId}
        onParamChange={handleParamChange}
      />

      <ContentRow>
        <SpcChartPanel chartData={chartData} currentParam={currentParam} />
        <SpcStatPanel stats={stats} violations={violations} />
      </ContentRow>
    </Container>
  );
};

export default SpcChartPage;

// --- Styled Components (기존 유지) ---
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
const ContentRow = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
`;
const ChartPanel = styled.div`
  flex: 3;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  min-height: 0;
  width: 100%;
`;
const SidePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
  overflow: hidden;
`;
const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
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
const AlertCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;
const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
  padding-right: 5px;
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
  flex-shrink: 0;
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
const EmptyAlert = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 20px 0;
`;
