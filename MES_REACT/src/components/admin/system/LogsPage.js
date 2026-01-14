// src/pages/system/LogsPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaBug,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSignInAlt,
  FaExpand,
  FaTimes,
  FaDownload,
  FaRedo,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Mock Data ---

// 1. 시간대별 로그 발생 추이 (차트용)
const LOG_TREND_DATA = [
  { time: "09:00", info: 120, warn: 5, error: 0 },
  { time: "10:00", info: 150, warn: 2, error: 1 },
  { time: "11:00", info: 180, warn: 8, error: 2 },
  { time: "12:00", info: 80, warn: 0, error: 0 },
  { time: "13:00", info: 130, warn: 4, error: 0 },
  { time: "14:00", info: 200, warn: 12, error: 5 }, // 에러 급증 구간
  { time: "15:00", info: 160, warn: 6, error: 1 },
];

// 2. 상세 로그 리스트
const LOG_LIST = [
  {
    id: 1001,
    level: "ERROR",
    type: "SYSTEM",
    source: "SchedulerService",
    msg: "Connection timed out: DB_PROD_01",
    user: "SYSTEM",
    time: "2024-05-20 14:15:22",
    detail:
      "java.sql.SQLTimeoutException: ORA-12170: TNS:Connect timeout occurred\n at oracle.jdbc.driver.T4CConnection.logon(T4CConnection.java:459)\n at ...",
  },
  {
    id: 1002,
    level: "WARN",
    type: "APP",
    source: "WorkOrderController",
    msg: "Invalid parameter: planQty cannot be negative",
    user: "User-Kim",
    time: "2024-05-20 14:12:05",
    detail: "{ input: { planQty: -50, productId: 'HBM3' } }",
  },
  {
    id: 1003,
    level: "INFO",
    type: "ACCESS",
    source: "AuthService",
    msg: "User Login Successful",
    user: "User-Lee",
    time: "2024-05-20 14:10:00",
    detail: "IP: 192.168.10.55, Browser: Chrome 120",
  },
  {
    id: 1004,
    level: "ERROR",
    type: "EQUIP",
    source: "EqInterface_TCB01",
    msg: "SECS/GEM Communication Failure",
    user: "SYSTEM",
    time: "2024-05-20 14:05:11",
    detail: "S1F13 Receive Timeout. Equipment did not respond.",
  },
  {
    id: 1005,
    level: "INFO",
    type: "APP",
    source: "MaterialService",
    msg: "Inventory Updated: RM-WF-001",
    user: "User-Park",
    time: "2024-05-20 14:01:30",
    detail: "Old: 100 -> New: 200",
  },
  {
    id: 1006,
    level: "WARN",
    type: "SYSTEM",
    source: "MemoryMonitor",
    msg: "Heap memory usage high (85%)",
    user: "SYSTEM",
    time: "2024-05-20 13:55:00",
    detail: "Max: 4096MB, Used: 3481MB",
  },
  {
    id: 1007,
    level: "INFO",
    type: "ACCESS",
    source: "AuthService",
    msg: "User Logout",
    user: "User-Choi",
    time: "2024-05-20 13:45:22",
    detail: "Session duration: 4h 20m",
  },
];

const LogsPage = () => {
  const [logs, setLogs] = useState(LOG_LIST);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null); // 모달용

  // 필터링 로직
  const filteredLogs = logs.filter((log) => {
    const matchLevel = filterLevel === "ALL" || log.level === filterLevel;
    const matchSearch =
      log.msg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLevel && matchSearch;
  });

  // 로그 레벨별 아이콘/색상
  const getLevelStyle = (level) => {
    switch (level) {
      case "ERROR":
        return { color: "#e74c3c", bg: "#fdebd0", icon: <FaBug /> };
      case "WARN":
        return {
          color: "#f39c12",
          bg: "#fef9e7",
          icon: <FaExclamationTriangle />,
        };
      case "INFO":
        return { color: "#2ecc71", bg: "#eafaf1", icon: <FaInfoCircle /> };
      default:
        return { color: "#95a5a6", bg: "#f4f6f7", icon: <FaInfoCircle /> };
    }
  };

  return (
    <Container>
      {/* 1. 상단 통계 차트 (최근 트렌드) */}
      <TopSection>
        <ChartCard>
          <CardHeader>
            <CardTitle>Log Occurrence Trend (Today)</CardTitle>
            <RefreshBtn>
              <FaRedo /> Real-time
            </RefreshBtn>
          </CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={LOG_TREND_DATA}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend iconType="circle" />
              <Bar
                dataKey="error"
                name="Error"
                stackId="a"
                fill="#e74c3c"
                barSize={30}
              />
              <Bar
                dataKey="warn"
                name="Warning"
                stackId="a"
                fill="#f39c12"
                barSize={30}
              />
              <Bar
                dataKey="info"
                name="Info"
                stackId="a"
                fill="#2ecc71"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <StatsCardGroup>
          <StatBox $color="#e74c3c">
            <StatTitle>Today Errors</StatTitle>
            <StatValue>9</StatValue>
            <StatIcon>
              <FaBug />
            </StatIcon>
          </StatBox>
          <StatBox $color="#f39c12">
            <StatTitle>Warnings</StatTitle>
            <StatValue>37</StatValue>
            <StatIcon>
              <FaExclamationTriangle />
            </StatIcon>
          </StatBox>
          <StatBox $color="#3498db">
            <StatTitle>Total Access</StatTitle>
            <StatValue>1,240</StatValue>
            <StatIcon>
              <FaSignInAlt />
            </StatIcon>
          </StatBox>
        </StatsCardGroup>
      </TopSection>

      {/* 2. 로그 리스트 & 필터 */}
      <ListSection>
        <ControlBar>
          <FilterGroup>
            <LevelBtn
              $active={filterLevel === "ALL"}
              onClick={() => setFilterLevel("ALL")}
            >
              All
            </LevelBtn>
            <LevelBtn
              $active={filterLevel === "ERROR"}
              onClick={() => setFilterLevel("ERROR")}
              $color="#e74c3c"
            >
              Error
            </LevelBtn>
            <LevelBtn
              $active={filterLevel === "WARN"}
              onClick={() => setFilterLevel("WARN")}
              $color="#f39c12"
            >
              Warn
            </LevelBtn>
            <LevelBtn
              $active={filterLevel === "INFO"}
              onClick={() => setFilterLevel("INFO")}
              $color="#2ecc71"
            >
              Info
            </LevelBtn>
          </FilterGroup>

          <RightControls>
            <SearchBox>
              <FaSearch color="#aaa" />
              <input
                placeholder="Search Message, Source, User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            <ExportBtn>
              <FaDownload /> Export CSV
            </ExportBtn>
          </RightControls>
        </ControlBar>

        <TableContainer>
          <LogTable>
            <thead>
              <tr>
                <th width="12%">Time</th>
                <th width="8%">Level</th>
                <th width="8%">Type</th>
                <th width="15%">Source</th>
                <th>Message</th>
                <th width="10%">User</th>
                <th width="6%">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const style = getLevelStyle(log.level);
                return (
                  <tr key={log.id}>
                    <td className="mono">{log.time}</td>
                    <td>
                      <LevelBadge $color={style.color} $bg={style.bg}>
                        {style.icon} {log.level}
                      </LevelBadge>
                    </td>
                    <td>
                      <TypeBadge>{log.type}</TypeBadge>
                    </td>
                    <td className="source">{log.source}</td>
                    <td className="msg" title={log.msg}>
                      {log.msg}
                    </td>
                    <td>{log.user}</td>
                    <td align="center">
                      <DetailIcon onClick={() => setSelectedLog(log)}>
                        <FaExpand />
                      </DetailIcon>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </LogTable>
        </TableContainer>

        {/* 페이지네이션 (Mock) */}
        <Pagination>
          <PageBtn disabled>&lt;</PageBtn>
          <PageBtn $active>1</PageBtn>
          <PageBtn>2</PageBtn>
          <PageBtn>3</PageBtn>
          <PageBtn>&gt;</PageBtn>
        </Pagination>
      </ListSection>

      {/* 3. 상세 로그 모달 (Stack Trace 보기) */}
      {selectedLog && (
        <Overlay onClick={() => setSelectedLog(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader $level={selectedLog.level}>
              <ModalTitle>
                {getLevelStyle(selectedLog.level).icon} Log Details #
                {selectedLog.id}
              </ModalTitle>
              <CloseBtn onClick={() => setSelectedLog(null)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <DetailRow>
                <DetailLabel>Timestamp:</DetailLabel> {selectedLog.time}
              </DetailRow>
              <DetailRow>
                <DetailLabel>Source:</DetailLabel> {selectedLog.source}
              </DetailRow>
              <DetailRow>
                <DetailLabel>Message:</DetailLabel>{" "}
                <strong>{selectedLog.msg}</strong>
              </DetailRow>
              <Divider />
              <DetailLabel>Stack Trace / Payload:</DetailLabel>
              <CodeBlock>{selectedLog.detail}</CodeBlock>
            </ModalBody>
          </ModalBox>
        </Overlay>
      )}
    </Container>
  );
};

export default LogsPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`;

// Top Section
const TopSection = styled.div`
  display: flex;
  gap: 20px;
  height: 240px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const ChartCard = styled.div`
  flex: 3;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const RefreshBtn = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: #1a4f8b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    text-decoration: underline;
  }
`;

const StatsCardGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StatBox = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 5px solid ${(props) => props.$color};
  position: relative;
`;

const StatTitle = styled.div`
  font-size: 13px;
  color: #888;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-top: 5px;
`;

const StatIcon = styled.div`
  font-size: 24px;
  color: #eee;
`;

// List Section
const ListSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const LevelBtn = styled.button`
  padding: 6px 15px;
  border-radius: 20px;
  border: 1px solid
    ${(props) => (props.$active ? props.$color || "#555" : "#ddd")};
  background: ${(props) => (props.$active ? props.$color || "#555" : "white")};
  color: ${(props) => (props.$active ? "white" : "#555")};
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "" : "#f5f5f5")};
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: 10px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0 12px;
  border-radius: 6px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    width: 200px;
  }
`;

const ExportBtn = styled.button`
  padding: 0 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  &:hover {
    background: #f9f9f9;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background-color: #f8f9fa;
    position: sticky;
    top: 0;
    th {
      padding: 12px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;
    }
  }
  tbody {
    tr {
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 10px 12px;
      color: #333;
      vertical-align: middle;
    }
    tr:hover {
      background-color: #f8fbff;
    }
  }

  .mono {
    font-family: monospace;
    color: #555;
  }
  .source {
    color: #1a4f8b;
    font-weight: 600;
  }
  .msg {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const LevelBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
`;

const TypeBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #eee;
  color: #555;
  font-size: 11px;
`;

const DetailIcon = styled.button`
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  &:hover {
    color: #1a4f8b;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 15px;
`;

const PageBtn = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: ${(props) => (props.$active ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$active ? "white" : "#555")};
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: #f0f0f0;
  }
`;

// Modal
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: 700px;
  max-height: 80vh;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 15px 20px;
  background-color: ${(props) =>
    props.$level === "ERROR" ? "#fdebd0" : "#f8f9fa"};
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const DetailRow = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #666;
  width: 80px;
  display: inline-block;
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 15px 0;
`;

const CodeBlock = styled.pre`
  background: #2d3436;
  color: #dfe6e9;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
`;
