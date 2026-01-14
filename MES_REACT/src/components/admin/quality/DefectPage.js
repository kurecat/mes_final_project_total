// src/pages/quality/DefectPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaBug,
  FaSearch,
  FaFilter,
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

// --- Mock Data ---

// 1. 불량 파레토 차트 데이터 (80/20 법칙 분석용)
const PARETO_DATA = [
  { name: "TSV Void", count: 120, cum: 35 },
  { name: "μ-Bump Short", count: 85, cum: 60 },
  { name: "Chip Crack", count: 45, cum: 73 },
  { name: "Underfill Void", count: 35, cum: 83 }, // 누적 80% 지점
  { name: "Misalign", count: 30, cum: 92 },
  { name: "Particle", count: 20, cum: 98 },
  { name: "Scratch", count: 7, cum: 100 },
];

// 2. 불량 발생 로그 (리스트)
const DEFECT_LOGS = [
  {
    id: "DF-240520-001",
    time: "14:20:11",
    lotId: "LOT-HBM-099",
    waferId: "WF-05",
    coord: "(12, 05)",
    type: "TSV Void",
    process: "Etching",
    status: "NEW",
    image: true,
  },
  {
    id: "DF-240520-002",
    time: "13:45:22",
    lotId: "LOT-HBM-099",
    waferId: "WF-05",
    coord: "(08, 11)",
    type: "μ-Bump Short",
    process: "Bonding",
    status: "VERIFIED",
    image: true,
  },
  {
    id: "DF-240520-003",
    time: "11:10:05",
    lotId: "LOT-HBM-098",
    waferId: "WF-12",
    coord: "(15, 09)",
    type: "Chip Crack",
    process: "Grinding",
    status: "CLOSED",
    image: true,
  },
  {
    id: "DF-240520-004",
    time: "10:05:33",
    lotId: "LOT-HBM-098",
    waferId: "WF-12",
    coord: "(10, 10)",
    type: "Particle",
    process: "Cleaning",
    status: "NEW",
    image: false,
  },
  {
    id: "DF-240520-005",
    time: "09:30:15",
    lotId: "LOT-HBM-097",
    waferId: "WF-01",
    coord: "(05, 05)",
    type: "Misalign",
    process: "Bonding",
    status: "VERIFIED",
    image: true,
  },
];

// 3. 가상의 Wafer Map 데이터 생성 (10x10 Grid)
// 1: Good, 0: Defect, -1: Empty(원형 밖)
const generateWaferMap = () => {
  const map = [];
  const size = 12; // Grid Size
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt(
        Math.pow(x - center + 0.5, 2) + Math.pow(y - center + 0.5, 2)
      );
      if (distance < radius) {
        // 원 안쪽: 랜덤하게 불량(0) 생성
        map.push({ x, y, status: Math.random() > 0.9 ? 0 : 1 });
      } else {
        // 원 바깥
        map.push({ x, y, status: -1 });
      }
    }
  }
  return map;
};

const WAFER_MAP = generateWaferMap();

const DefectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 필터링
  const filteredLogs = DEFECT_LOGS.filter((log) => {
    const matchSearch =
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lotId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Container>
      {/* 1. 상단 통계 카드 */}
      <StatsRow>
        <StatCard>
          <IconBox $color="#e74c3c">
            <FaBug />
          </IconBox>
          <StatInfo>
            <Label>Today's Defects</Label>
            <Value>
              42 <Unit>ea</Unit>
            </Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#f39c12">
            <FaExclamationTriangle />
          </IconBox>
          <StatInfo>
            <Label>Worst Process</Label>
            <Value style={{ fontSize: 20 }}>TSV Etching</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#2ecc71">
            <FaCheckDouble />
          </IconBox>
          <StatInfo>
            <Label>Action Completed</Label>
            <Value>
              35 <Unit>ea</Unit>
            </Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#3498db">
            <FaMicroscope />
          </IconBox>
          <StatInfo>
            <Label>Yield Rate</Label>
            <Value>
              92.4 <Unit>%</Unit>
            </Value>
          </StatInfo>
        </StatCard>
      </StatsRow>

      {/* 2. 메인 시각화 영역 (좌: 파레토 차트, 우: 웨이퍼 맵) */}
      <VizSection>
        {/* 파레토 차트 */}
        <ChartCard>
          <CardHeader>
            <CardTitle>
              <FaChartBar /> Defect Pareto Analysis
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={PARETO_DATA}
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
                name="Defect Count"
                fill="#1a4f8b"
                barSize={30}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cum"
                name="Cumulative %"
                stroke="#e74c3c"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 웨이퍼 맵 시각화 */}
        <MapCard>
          <CardHeader>
            <CardTitle>Live Wafer Map Monitoring</CardTitle>
            <MapMeta>Lot: LOT-HBM-099 | WF-05</MapMeta>
          </CardHeader>
          <WaferContainer>
            <WaferGrid>
              {WAFER_MAP.map((die, idx) => (
                <Die key={idx} $status={die.status} />
              ))}
            </WaferGrid>
            <MapLegend>
              <LegendItem>
                <Dot color="#2ecc71" /> Good
              </LegendItem>
              <LegendItem>
                <Dot color="#e74c3c" /> Defect
              </LegendItem>
            </MapLegend>
          </WaferContainer>
        </MapCard>
      </VizSection>

      {/* 3. 하단 불량 상세 리스트 */}
      <ListSection>
        <ListHeader>
          <CardTitle>Defect Occurrence List</CardTitle>
          <ControlGroup>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </FilterSelect>
            <SearchBox>
              <FaSearch color="#aaa" />
              <input
                placeholder="Search Type or Lot ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>Lot / Wafer ID</th>
                <th>Coordinate</th>
                <th>Defect Type</th>
                <th>Process</th>
                <th>Image</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.time}</td>
                  <td style={{ fontWeight: "bold", color: "#e74c3c" }}>
                    {log.id}
                  </td>
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
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ListSection>
    </Container>
  );
};

export default DefectPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
`;

// Stats Row
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

// Visualization Section
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

// Wafer Map Visualization
const WaferContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const WaferGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 20px);
  gap: 2px;
  padding: 10px;
  background: #333;
  border-radius: 50%; /* 웨이퍼 모양 원형 */
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Die = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) =>
    props.$status === 1
      ? "#2ecc71" // Good
      : props.$status === 0
      ? "#e74c3c" // Defect
      : "transparent"}; // Empty (Outside)

  border-radius: 2px;
  /* Hover effect for dies */
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

// List Section
const ListSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
      : props.$status === "VERIFIED"
      ? "#e3f2fd"
      : "#e8f5e9"};
  color: ${(props) =>
    props.$status === "NEW"
      ? "#c62828"
      : props.$status === "VERIFIED"
      ? "#1976d2"
      : "#2e7d32"};
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
