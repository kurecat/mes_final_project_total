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
import axiosInstance from "../../../api/axios";

// --- Custom Dot (규격 벗어난 점 표시) ---
const CustomDot = (props) => {
  const { cx, cy, value, ucl, lcl } = props;
  // 상한/하한이 없으면(undefined) 정상으로 간주
  const isOOC =
    (ucl !== undefined && value > ucl) || (lcl !== undefined && value < lcl);

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

// --- Header ---
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
            {parameters.length === 0 && (
              <option value="">No Parameters (DB Check Needed)</option>
            )}
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

// --- Chart Panel ---
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

            {/* 기준선 그리기 (데이터가 있을 때만) */}
            {currentParam.ucl !== undefined && (
              <ReferenceLine
                y={currentParam.ucl}
                label="UCL"
                stroke="#e74c3c"
                strokeDasharray="5 5"
              />
            )}
            {currentParam.ucl !== undefined &&
              currentParam.lcl !== undefined && (
                <ReferenceLine
                  y={(currentParam.ucl + currentParam.lcl) / 2}
                  label="Target"
                  stroke="#2ecc71"
                  strokeDasharray="3 3"
                />
              )}
            {currentParam.lcl !== undefined && (
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

// --- Stats Panel ---
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
                  <div className="desc">Val {v.value} (Limit Exceeded)</div>
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

// --- Main Page Component ---
const SpcChartPage = () => {
  const [parameters, setParameters] = useState([]);
  const [selectedParamId, setSelectedParamId] = useState("");
  const [rawLogs, setRawLogs] = useState([]);

  // 1. 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching SPC Data...");
        const [stdRes, dataRes] = await Promise.all([
          axiosInstance.get("/api/mes/quality/standard"),
          axiosInstance.get("/api/mes/quality/spc"),
        ]);

        console.log("✅ Standards:", stdRes.data);
        console.log("✅ SPC Logs:", dataRes.data);

        // 기준 정보 가공
        const params = (stdRes.data || []).map((p) => ({
          id: p.id,
          processName: p.processName,
          checkItem: p.checkItem,
          ucl: p.usl, // DB 필드명 매칭
          lcl: p.lsl,
          unit: p.unit,
        }));

        setParameters(params);
        setRawLogs(dataRes.data || []);

        // 첫 번째 항목 자동 선택
        if (params.length > 0) {
          setSelectedParamId(params[0].id);
        }
      } catch (error) {
        console.error("❌ SPC 데이터 조회 실패:", error);
      }
    };
    fetchData();
  }, []);

  const handleParamChange = useCallback(
    (e) => setSelectedParamId(Number(e.target.value)),
    [],
  );

  // 선택된 파라미터 찾기
  const currentParam = useMemo(
    () => parameters.find((p) => p.id === selectedParamId) || {},
    [parameters, selectedParamId],
  );

  // 2. 차트 데이터 가공 (★ 여기가 핵심 수정됨)
  // 2. 차트 데이터 가공 (★ 여기가 완전히 새로워졌습니다!)
  const chartData = useMemo(() => {
    if (!rawLogs || rawLogs.length === 0) return [];
    if (!currentParam || !currentParam.checkItem) return [];

    // 백엔드가 준 데이터 중에서, "지금 선택한 공정"과 "항목"이 일치하는 것만 골라냄
    const filteredLogs = rawLogs.filter(
      (log) =>
        log.processName === currentParam.processName && // 예: DieBonding
        log.checkItem === currentParam.checkItem, // 예: curingTemp
    );

    // 날짜순 정렬 (차트가 꼬이지 않게)
    filteredLogs.sort((a, b) => new Date(a.time) - new Date(b.time));

    return filteredLogs
      .map((log) => ({
        time: new Date(log.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        value: log.value, // 이미 백엔드에서 숫자로 바꿔서 줬음!
      }))
      .slice(-30); // 최근 30개만 표시
  }, [rawLogs, currentParam]);

  // 3. 통계 계산
  const stats = useMemo(() => {
    if (chartData.length === 0) return { mean: 0, stdDev: 0, cp: 0, cpk: 0 };

    const values = chartData.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      (values.length || 1);
    const stdDev = Math.sqrt(variance);

    const { ucl = 0, lcl = 0 } = currentParam;
    const safeStdDev = stdDev === 0 ? 1 : stdDev; // 0 나누기 방지

    const cp = (ucl - lcl) / (6 * safeStdDev);
    const cpu = (ucl - mean) / (3 * safeStdDev);
    const cpl = (mean - lcl) / (3 * safeStdDev);
    const cpk = Math.min(cpu, cpl);

    return {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      cp: isFinite(cp) ? cp.toFixed(2) : 0,
      cpk: isFinite(cpk) ? cpk.toFixed(2) : 0,
    };
  }, [chartData, currentParam]);

  // 4. 불량(OOC) 감지
  const violations = useMemo(() => {
    const { ucl, lcl } = currentParam;
    if (ucl === undefined || lcl === undefined) return [];
    return chartData.filter((d) => d.value > ucl || d.value < lcl);
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

// --- Styled Components ---
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
  margin-bottom: 20px;
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
