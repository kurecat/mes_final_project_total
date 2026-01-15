// src/pages/quality/DefectPage.js
import React, { useState, useEffect } from "react";
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

// --- Wafer Map Logic (Client Side Generation 유지) ---
// 1: Good (Prime), 2: Repairable (수리 가능), 0: Reject (폐기), -1: Empty
const generateWaferMap = () => {
  const map = [];
  const size = 14;
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt(
        Math.pow(x - center + 0.5, 2) + Math.pow(y - center + 0.5, 2)
      );
      if (distance < radius) {
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
  // --- State for Data ---
  const [stats, setStats] = useState({
    totalDefects: 0,
    worstStep: "-",
    repairedCount: 0,
    primeYield: 0,
  });
  const [paretoData, setParetoData] = useState([]);
  const [defectLogs, setDefectLogs] = useState([]);

  // --- State for Filters ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // json-server 기본 포트 3001 가정
        const baseUrl = "http://localhost:3001";

        const [statsRes, paretoRes, logsRes] = await Promise.all([
          fetch(`${baseUrl}/stats`),
          fetch(`${baseUrl}/paretoData`),
          fetch(`${baseUrl}/defectLogs`),
        ]);

        const statsData = await statsRes.json();
        const paretoData = await paretoRes.json();
        const logsData = await logsRes.json();

        setStats(statsData);
        setParetoData(paretoData);
        setDefectLogs(logsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // --- Filter Logic ---
  const filteredLogs = defectLogs.filter((log) => {
    const matchSearch =
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lotId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Container>
      {/* 1. 상단 통계 카드 (Dynamic Data) */}
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
            <Label>Worst Step</Label>
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
            <Label>Prime Yield</Label>
            <Value>
              {stats.primeYield} <Unit>%</Unit>
            </Value>
          </StatInfo>
        </StatCard>
      </StatsRow>

      {/* 2. 메인 시각화 영역 */}
      <VizSection>
        {/* 파레토 차트 (Dynamic Data) */}
        <ChartCard>
          <CardHeader>
            <CardTitle>
              <FaChartBar /> Defect Pareto (Fail Mode)
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={paretoData}
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

        {/* 웨이퍼 맵 시각화 (Logic Maintained) */}
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

      {/* 3. 하단 불량 상세 리스트 (Dynamic Data) */}
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
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
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
                      <StatusBadge $status={log.status}>
                        {log.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionBtn>Detail</ActionBtn>
                    </td>
                  </tr>
                ))
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
    </Container>
  );
};

export default DefectPage;

// --- Styled Components (기존과 동일) ---
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
