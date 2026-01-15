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

// --- Mock Data (D-RAM 관련 데이터) ---

// 1. D-RAM 주요 불량 파레토 (Fab & EDS 공정)
const PARETO_DATA = [
  { name: "Single Bit Fail", count: 150, cum: 30 }, // 셀 하나 불량 (Repair 가능성 높음)
  { name: "Word-Line Open", count: 110, cum: 52 }, // 라인 단선
  { name: "Pattern Short", count: 80, cum: 68 }, // 회로 합선
  { name: "Particle", count: 60, cum: 80 }, // 이물질 (누적 80%)
  { name: "Multi-Bit Fail", count: 45, cum: 89 },
  { name: "Scratch", count: 35, cum: 96 },
  { name: "Oxide Thickness", count: 20, cum: 100 },
];

// 2. 불량 발생 로그 (리스트) - 공정 변경 (Photo, Etch, EDS)
const DEFECT_LOGS = [
  {
    id: "DF-240601-001",
    time: "14:20:11",
    lotId: "LOT-DDR5-101",
    waferId: "WF-05",
    coord: "(12, 05)",
    type: "Pattern Short",
    process: "Etching (Poly)",
    status: "NEW",
    image: true,
  },
  {
    id: "DF-240601-002",
    time: "13:45:22",
    lotId: "LOT-DDR5-101",
    waferId: "WF-05",
    coord: "(08, 11)",
    type: "Single Bit Fail",
    process: "EDS Test",
    status: "REPAIRED",
    image: false,
  }, // 수리 완료됨
  {
    id: "DF-240601-003",
    time: "11:10:05",
    lotId: "LOT-DDR5-098",
    waferId: "WF-12",
    coord: "(15, 09)",
    type: "Particle",
    process: "Photo (Litho)",
    status: "CLOSED",
    image: true,
  },
  {
    id: "DF-240601-004",
    time: "10:05:33",
    lotId: "LOT-DDR5-098",
    waferId: "WF-12",
    coord: "(10, 10)",
    type: "Scratch",
    process: "CMP",
    status: "NEW",
    image: true,
  },
  {
    id: "DF-240601-005",
    time: "09:30:15",
    lotId: "LOT-DDR5-097",
    waferId: "WF-01",
    coord: "(05, 05)",
    type: "Word-Line Open",
    process: "EDS Test",
    status: "VERIFIED",
    image: false,
  },
];

// 3. Wafer Map (Binning)
// 1: Good (Prime), 2: Repairable (수리 가능), 0: Reject (폐기), -1: Empty
const generateWaferMap = () => {
  const map = [];
  const size = 14; // D-RAM은 칩 사이즈가 작아 Grid가 더 촘촘함
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt(
        Math.pow(x - center + 0.5, 2) + Math.pow(y - center + 0.5, 2)
      );
      if (distance < radius) {
        // 랜덤 상태 생성 (D-RAM은 Repairable 비중이 중요)
        const rand = Math.random();
        let status = 1; // Good
        if (rand > 0.9) status = 0; // Reject
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

const DefectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
            <Label>Total Defects</Label>
            <Value>
              52 <Unit>ea</Unit>
            </Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#f39c12">
            <FaExclamationTriangle />
          </IconBox>
          <StatInfo>
            <Label>Worst Step</Label>
            <Value style={{ fontSize: 20 }}>Poly Etching</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#2ecc71">
            <FaCheckDouble />
          </IconBox>
          <StatInfo>
            <Label>Repaired Count</Label>
            <Value>
              12 <Unit>chips</Unit>
            </Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#3498db">
            <FaMicroscope />
          </IconBox>
          <StatInfo>
            <Label>Prime Yield</Label>
            <Value>
              94.8 <Unit>%</Unit>
            </Value>
          </StatInfo>
        </StatCard>
      </StatsRow>

      {/* 2. 메인 시각화 영역 */}
      <VizSection>
        {/* 파레토 차트 */}
        <ChartCard>
          <CardHeader>
            <CardTitle>
              <FaChartBar /> Defect Pareto (Fail Mode)
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

        {/* 웨이퍼 맵 시각화 (Binning) */}
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
              <option value="REPAIRED">Repaired</option>
              <option value="VERIFIED">Verified</option>
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

// --- Styled Components (기존 디자인 유지) ---

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
      ? "#2ecc71" // Good
      : props.$status === 2
      ? "#f1c40f" // Repairable (Yellow)
      : props.$status === 0
      ? "#e74c3c" // Reject
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
