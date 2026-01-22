// src/pages/system/LogsPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  FaServer,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBug,
  FaShieldAlt,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// --- Helper Functions ---
const getLevelBadge = (level) => {
  switch (level) {
    case "INFO":
      return (
        <Badge $color="#3498db" $bg="#ebf5fb">
          <FaInfoCircle /> INFO
        </Badge>
      );
    case "WARN":
      return (
        <Badge $color="#f39c12" $bg="#fef9e7">
          <FaExclamationTriangle /> WARN
        </Badge>
      );
    case "ERROR":
      return (
        <Badge $color="#e74c3c" $bg="#fdedec">
          <FaBug /> ERROR
        </Badge>
      );
    case "SECURITY":
      return (
        <Badge $color="#9b59b6" $bg="#f5eef8">
          <FaShieldAlt /> SEC
        </Badge>
      );
    default:
      return (
        <Badge $color="#95a5a6" $bg="#f4f6f7">
          {level}
        </Badge>
      );
  }
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Component
const LogHeader = React.memo(
  ({ levelFilter, onFilterChange, searchTerm, onSearchChange, onExport }) => {
    return (
      <Header>
        <TitleGroup>
          <FaServer size={22} color="#34495e" />
          <h1>System Logs & Audit</h1>
        </TitleGroup>
        <Controls>
          <FilterGroup>
            <FaFilter color="#666" />
            <Select value={levelFilter} onChange={onFilterChange}>
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="SECURITY">SECURITY</option>
            </Select>
          </FilterGroup>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search Message, User, Category..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
          <DownloadBtn onClick={onExport}>
            <FaDownload /> Export
          </DownloadBtn>
        </Controls>
      </Header>
    );
  },
);

// 2. Detail Row Component
const LogDetailRow = React.memo(({ log }) => {
  return (
    <DetailRow>
      <td colSpan="7">
        <DetailBox>
          <div className="label">Log ID: {log.id}</div>
          <pre>{log.details || "No additional details available."}</pre>
        </DetailBox>
      </td>
    </DetailRow>
  );
});

// 3. Table Row Component
const LogTableRow = React.memo(({ log, isExpanded, onToggleExpand }) => {
  return (
    <>
      <LogRow
        $level={log.level}
        onClick={() => onToggleExpand(log.id)}
        $expanded={isExpanded}
      >
        <td className="mono">{log.timestamp.replace("T", " ")}</td>
        <td>{getLevelBadge(log.level)}</td>
        <td className="category">{log.category}</td>
        <td className="message">{log.message}</td>
        <td>{log.userId}</td>
        <td className="mono">{log.userIp}</td>
        <td>
          {isExpanded ? (
            <FaChevronUp color="#999" />
          ) : (
            <FaChevronDown color="#ccc" />
          )}
        </td>
      </LogRow>
      {isExpanded && <LogDetailRow log={log} />}
    </>
  );
});

// 4. Table Component
const LogTableComponent = React.memo(
  ({ logs, expandedLogId, onToggleExpand }) => {
    return (
      <TableContainer>
        <LogTable>
          <thead>
            <tr>
              <th width="180">Timestamp</th>
              <th width="100">Level</th>
              <th width="120">Category</th>
              <th>Message</th>
              <th width="120">User</th>
              <th width="120">IP</th>
              <th width="50"></th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <LogTableRow
                  key={log.id}
                  log={log}
                  isExpanded={expandedLogId === log.id}
                  onToggleExpand={onToggleExpand}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </LogTable>
      </TableContainer>
    );
  },
);

// --- Main Component ---

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Data Fetching
  useEffect(() => {
    fetch("http://localhost:3001/systemLogs")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
        setLogs(sorted);
      })
      .catch((err) => console.error("Failed to fetch logs:", err));
  }, []);

  // Handlers (useCallback)
  const toggleExpand = useCallback((id) => {
    setExpandedLogId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleFilterChange = useCallback((e) => {
    setLevelFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleExport = useCallback(() => {
    alert("Exporting logs...");
  }, []);

  // Filtering Logic (useMemo)
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (levelFilter !== "ALL") {
      result = result.filter((log) => log.level === levelFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(lowerTerm) ||
          log.category.toLowerCase().includes(lowerTerm) ||
          log.userId.toLowerCase().includes(lowerTerm),
      );
    }
    return result;
  }, [logs, levelFilter, searchTerm]);

  return (
    <Container>
      <LogHeader
        levelFilter={levelFilter}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
      />

      <LogTableComponent
        logs={filteredLogs}
        expandedLogId={expandedLogId}
        onToggleExpand={toggleExpand}
      />
    </Container>
  );
};

export default LogsPage;

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
  gap: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
`;

const Select = styled.select`
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  background: transparent;
  color: #333;
  cursor: pointer;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 300px;

  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    font-size: 14px;
    width: 100%;
  }
`;

const DownloadBtn = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #34495e;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa;
  }

  th {
    text-align: left;
    background: #f8f9fa;
    padding: 12px 15px;
    font-size: 13px;
    color: #555;
    border-bottom: 2px solid #eee;
  }

  td {
    padding: 10px 15px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  .mono {
    font-family: "Consolas", "Monaco", monospace;
    font-size: 13px;
    color: #555;
  }

  .category {
    font-weight: 600;
    font-size: 12px;
    color: #2c3e50;
  }

  .message {
    color: #222;
  }

  .empty {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
`;

const LogRow = styled.tr`
  cursor: pointer;
  background-color: ${(props) => (props.$expanded ? "#f8f9fa" : "white")};
  border-left: 4px solid
    ${(props) => {
      switch (props.$level) {
        case "ERROR":
          return "#e74c3c";
        case "WARN":
          return "#f39c12";
        case "SECURITY":
          return "#9b59b6";
        default:
          return "transparent";
      }
    }};

  &:hover {
    background-color: #f1f5f9;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
`;

const DetailRow = styled.tr`
  background-color: #f8f9fa;
  td {
    border-bottom: 2px solid #eee;
    padding: 0 15px 15px 15px;
  }
`;

const DetailBox = styled.div`
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 6px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 13px;
  margin-left: 40px;
  position: relative;
  white-space: pre-wrap;

  .label {
    position: absolute;
    top: -10px;
    left: 10px;
    background: #f39c12;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;
