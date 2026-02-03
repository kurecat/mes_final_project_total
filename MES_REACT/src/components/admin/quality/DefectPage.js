import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  FaBug,
  FaSearch,
  FaFileImage,
  FaCheckDouble,
  FaExclamationTriangle,
  FaMicroscope,
  FaChartBar,
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
} from "recharts";

// ★ API 연결을 위해 axios import 추가
import axiosInstance from "../../../api/axios";

// --- Wafer Map Logic (Client Side Generation) ---
const generateWaferMap = () => {
  const map = [];
  const size = 14;
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt(
        Math.pow(x - center + 0.5, 2) + Math.pow(y - center + 0.5, 2),
      );
      if (distance < radius) {
        const rand = Math.random();
        let status = 1; // Good
        if (rand > 0.9)
          status = 0; // Reject
        else if (rand > 0.8) status = 2; // Repairable
        map.push({ x, y, status });
      } else {
        map.push({ x, y, status: -1 });
      }
    }
  }
  return map;
};

const WAFER_MAP = generateWaferMap();

// --- Sub-Components ---

// 1. Stats Component
const DefectStats = React.memo(({ stats }) => {
  return (
    <StatsRow>
      <StatCard>
        <IconBox $color="#e74c3c">
          <FaBug />
        </IconBox>
        <StatInfo>
          <Label>Total Defects</Label>
          <Value>
            {stats.totalDefects} <Unit>ea</Unit>
          </Value>
        </StatInfo>
      </StatCard>
      <StatCard>
        <IconBox $color="#f39c12">
          <FaExclamationTriangle />
        </IconBox>
        <StatInfo>
          <Label>Worst Defect</Label>
          <Value style={{ fontSize: 20 }}>{stats.worstStep}</Value>
        </StatInfo>
      </StatCard>
      <StatCard>
        <IconBox $color="#2ecc71">
          <FaCheckDouble />
        </IconBox>
        <StatInfo>
          <Label>Repaired Count</Label>
          <Value>
            {stats.repairedCount} <Unit>chips</Unit>
          </Value>
        </StatInfo>
      </StatCard>
      <StatCard>
        <IconBox $color="#3498db">
          <FaMicroscope />
        </IconBox>
        <StatInfo>
          <Label>Avg Yield</Label>
          <Value>
            {stats.primeYield} <Unit>%</Unit>
          </Value>
        </StatInfo>
      </StatCard>
    </StatsRow>
  );
});

// 2. Chart Component
const DefectChart = React.memo(({ data }) => {
  return (
    <ChartCard>
      <CardHeader>
        <CardTitle>
          <FaChartBar /> Defect Pareto (Fail Mode)
        </CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" fontSize={12} tick={{ dy: 5 }} />
          <YAxis
            yAxisId="left"
            label={{ value: "Count", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="count"
            name="Count"
            fill="#1a4f8b"
            barSize={30}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cum"
            name="Cum %"
            stroke="#e74c3c"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});

// 3. Wafer Map Component
const WaferMap = React.memo(() => {
  return (
    <MapCard>
      <CardHeader>
        <CardTitle>EDS Map Monitoring</CardTitle>
        <MapMeta>DDR5-16Gb | WF-05</MapMeta>
      </CardHeader>
      <WaferContainer>
        <WaferGrid>
          {WAFER_MAP.map((die, idx) => (
            <Die key={idx} $status={die.status} />
          ))}
        </WaferGrid>
        <MapLegend>
          <LegendItem>
            <Dot color="#2ecc71" /> Good (Prime)
          </LegendItem>
          <LegendItem>
            <Dot color="#f1c40f" /> Repairable
          </LegendItem>
          <LegendItem>
            <Dot color="#e74c3c" /> Reject (Bad)
          </LegendItem>
        </MapLegend>
      </WaferContainer>
    </MapCard>
  );
});

// 4. List Row Component
const DefectRow = React.memo(({ log }) => {
  return (
    <tr>
      <td>{log.time}</td>
      <td style={{ fontWeight: "bold", color: "#e74c3c" }}>{log.id}</td>
      <td>
        {log.lotId} / {log.waferId}
      </td>
      <td style={{ fontFamily: "monospace" }}>{log.coord}</td>
      <td>{log.type}</td>
      <td>{log.process}</td>
      <td>
        {log.image ? (
          <ImgBtn>
            <FaFileImage /> View
          </ImgBtn>
        ) : (
          <span style={{ color: "#ccc" }}>-</span>
        )}
      </td>
      <td>
        <StatusBadge $status={log.status}>{log.status}</StatusBadge>
      </td>
      <td>
        <ActionBtn>Detail</ActionBtn>
      </td>
    </tr>
  );
});

// 5. Defect List Component
const DefectList = React.memo(
  ({ logs, statusFilter, onStatusChange, searchTerm, onSearchChange }) => {
    return (
      <ListSection>
        <ListHeader>
          <CardTitle>Defect Occurrence List</CardTitle>
          <ControlGroup>
            <FilterSelect value={statusFilter} onChange={onStatusChange}>
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="REPAIRED">Repaired</option>
              <option value="VERIFIED">Verified</option>
            </FilterSelect>
            <SearchBox>
              <FaSearch color="#aaa" />
              <input
                placeholder="Search Type or Lot ID..."
                value={searchTerm}
                onChange={onSearchChange}
              />
            </SearchBox>
          </ControlGroup>
        </ListHeader>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Defect ID</th>
                <th>Lot / Wafer</th>
                <th>Coord</th>
                <th>Defect Mode</th>
                <th>Process Step</th>
                <th>Image</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => <DefectRow key={log.id} log={log} />)
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No defects found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </ListSection>
    );
  },
);

// --- Main Component ---

const DefectPage = () => {
  const [stats, setStats] = useState({
    totalDefects: 0,
    worstStep: "-",
    repairedCount: 0,
    primeYield: 0,
  });
  const [paretoData, setParetoData] = useState([]);
  const [defectLogs, setDefectLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ★ API 호출 및 데이터 가공 로직
  useEffect(() => {
    const fetchDefects = async () => {
      try {
        // 1. 백엔드에서 불량 내역 조회
        const response = await axiosInstance.get("/api/mes/quality/defect");
        const rawData = response.data || [];

        // 2. 리스트용 데이터 매핑
        const formattedLogs = rawData.map((item) => ({
          id: `DEF-${item.id}`,
          time: item.endTime
            ? new Date(item.endTime).toLocaleTimeString()
            : "-",
          lotId: item.workOrder?.workOrderNumber || "Unknown Lot",
          waferId: "WF-0" + (item.id % 9), // 임시 웨이퍼 ID
          coord: `(${Math.floor(Math.random() * 20)}, ${Math.floor(Math.random() * 20)})`, // 좌표 임시
          type: item.message || "Unknown", // 불량 원인(Message)을 Type으로 사용
          process: item.processStep || "Process",
          status: "NEW", // 기본 상태
          image: false,
          defectQty: item.defectQty || 0,
          resultQty: item.resultQty || 0,
        }));
        setDefectLogs(formattedLogs);

        // 3. 차트용 데이터 가공 (Pareto Analysis)
        // 불량 유형(type)별 카운트 집계
        const countMap = {};
        rawData.forEach((item) => {
          const type = item.message || "Unknown";
          countMap[type] = (countMap[type] || 0) + 1;
        });

        // 내림차순 정렬 및 배열 변환
        const sortedCounts = Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        // 누적 비율(Cumulative %) 계산
        const totalEvents = rawData.length;
        let runningSum = 0;
        const paretoData = sortedCounts.map((item) => {
          runningSum += item.count;
          return {
            name: item.name,
            count: item.count,
            cum:
              totalEvents === 0
                ? 0
                : Math.round((runningSum / totalEvents) * 100),
          };
        });
        setParetoData(paretoData);

        // 4. 통계(Stats) 계산
        const totalDefectQty = rawData.reduce(
          (acc, cur) => acc + (cur.defectQty || 0),
          0,
        );
        const totalResultQty = rawData.reduce(
          (acc, cur) => acc + (cur.resultQty || 0),
          0,
        );
        const totalProduction = totalResultQty + totalDefectQty;

        const yieldRate =
          totalProduction === 0
            ? 0
            : ((totalResultQty / totalProduction) * 100).toFixed(1);

        setStats({
          totalDefects: totalDefectQty || totalEvents,
          worstStep: sortedCounts.length > 0 ? sortedCounts[0].name : "-", // 가장 빈번한 불량
          repairedCount: 0, // 수리 로직은 아직 없음
          primeYield: yieldRate,
        });
      } catch (error) {
        console.error("불량 내역 조회 실패:", error);
      }
    };

    fetchDefects();
  }, []);

  const handleStatusChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredLogs = useMemo(() => {
    return defectLogs.filter((log) => {
      const matchSearch =
        log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.lotId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [defectLogs, searchTerm, statusFilter]);

  return (
    <Container>
      <Header>
        <TitleArea>
          <PageTitle>
            <FaBug /> Defect Management
          </PageTitle>
          <SubTitle>Real-time Defect Monitoring & Analysis</SubTitle>
        </TitleArea>
      </Header>

      <DefectStats stats={stats} />

      <VizSection>
        <DefectChart data={paretoData} />
        <WaferMap />
      </VizSection>

      <DefectList
        logs={filteredLogs}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
    </Container>
  );
};

export default DefectPage;

// --- Styled Components (기존과 동일하게 유지) ---
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  /* margin-bottom: 100px; */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
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

const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 10px;
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

const StatInfo = styled.div`
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

const VizSection = styled.div`
  display: flex;
  gap: 20px;
  height: 400px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const ChartCard = styled.div`
  flex: 2;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const MapCard = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const MapMeta = styled.span`
  font-size: 12px;
  color: #666;
  background: #eee;
  padding: 2px 8px;
  border-radius: 10px;
`;

const WaferContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const WaferGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(14, 16px);
  gap: 2px;
  padding: 10px;
  background: #2c3e50;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Die = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${(props) =>
    props.$status === 1
      ? "#2ecc71"
      : props.$status === 2
        ? "#f1c40f"
        : props.$status === 0
          ? "#e74c3c"
          : "transparent"};
  border-radius: 1px;
  &:hover {
    opacity: 0.8;
    cursor: pointer;
    transform: scale(1.1);
  }
`;

const MapLegend = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #555;
`;
const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const ListSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 50px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
  }
`;

const TableContainer = styled.div`
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "NEW"
      ? "#ffebee"
      : props.$status === "REPAIRED"
        ? "#e8f5e9"
        : "#e3f2fd"};
  color: ${(props) =>
    props.$status === "NEW"
      ? "#c62828"
      : props.$status === "REPAIRED"
        ? "#2ecc71"
        : "#1565c0"};
`;

const ImgBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #ddd;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
  }
`;

const ActionBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #133b6b;
  }
`;
