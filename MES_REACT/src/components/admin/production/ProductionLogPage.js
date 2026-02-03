import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaServer,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
} from "react-icons/fa";

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
    default:
      return (
        <Badge $color="#95a5a6" $bg="#f4f6f7">
          {level}
        </Badge>
      );
  }
};

const LogHeader = React.memo(
  ({ levelFilter, onFilterChange, searchTerm, onSearchChange }) => (
    <Header>
      <TitleGroup>
        <FaServer size={22} color="#34495e" />
        <h1>Production Event Logs</h1>
      </TitleGroup>
      <Controls>
        <FilterGroup>
          <FaFilter color="#666" />
          <Select value={levelFilter} onChange={onFilterChange}>
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
          </Select>
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#aaa" />
          <input
            placeholder="Search message..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
      </Controls>
    </Header>
  ),
);

const LogTableRow = React.memo(
  ({
    log,
    isExpanded,
    onToggleExpand,
    editingMap,
    setEditingMap,
    startEdit,
    saveEdit,
  }) => {
    const isEditing = editingMap[log.id] !== undefined;

    return (
      <>
        <LogRow
          $level={log.level}
          $expanded={isExpanded}
          onClick={() => onToggleExpand(log.id)}
        >
          <td className="mono">{log.timestamp}</td>
          <td>{getLevelBadge(log.level)}</td>
          <td className="category">{log.category}</td>
          <td
            className="message"
            onClick={(e) => isEditing && e.stopPropagation()}
          >
            {isEditing ? (
              <input
                autoFocus
                value={editingMap[log.id]}
                onChange={(e) =>
                  setEditingMap((prev) => ({
                    ...prev,
                    [log.id]: e.target.value,
                  }))
                }
                style={{ width: "100%", padding: "4px" }}
              />
            ) : (
              log.message
            )}
          </td>
          <td>
            {isEditing ? (
              <IconBtn
                onClick={(e) => {
                  e.stopPropagation();
                  saveEdit(log.id);
                }}
              >
                <FaSave style={{ color: "#27ae60" }} />
              </IconBtn>
            ) : (
              <IconBtn
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(log);
                }}
              >
                <FaEdit />
              </IconBtn>
            )}
          </td>
          <td>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</td>
        </LogRow>
        {isExpanded && (
          <DetailRow>
            <td colSpan="6">
              <DetailBox>
                <div className="label">Log ID: {log.id}</div>
                <pre>{JSON.stringify(log.raw, null, 2)}</pre>
              </DetailBox>
            </td>
          </DetailRow>
        )}
      </>
    );
  },
);

const LogTableComponent = React.memo((props) => (
  <TableContainer>
    <LogTable>
      <thead>
        <tr>
          <th width="180">Timestamp</th>
          <th width="100">Level</th>
          <th width="120">Category</th>
          <th>Message</th>
          <th width="50"></th>
          <th width="50"></th>
        </tr>
      </thead>
      <tbody>
        {props.logs.map((log) => (
          <LogTableRow
            key={log.id}
            log={log}
            isExpanded={props.expandedLogId === log.id}
            {...props}
          />
        ))}
      </tbody>
    </LogTable>
  </TableContainer>
));

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [editingMap, setEditingMap] = useState({});

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/mes/event-log");
      const mapped = res.data.map((item) => ({
        id: item.id, // ← 이것만 허용
        timestamp: new Date(item.timestamp).toLocaleString(),
        level: item.level,
        category: item.category,
        message: item.message ?? "",
        raw: item,
      }));

      setLogs(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const startEdit = (log) => {
    setEditingMap((prev) => ({ ...prev, [log.id]: log.message ?? "" }));
  };

  const saveEdit = async (id) => {
    const msg = editingMap[id];
    try {
      await api.patch(`/api/mes/event-log/${id}`, { message: msg });
      setEditingMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchLogs();
    } catch (error) {
      alert("수정 실패: 해당 데이터를 찾을 수 없거나 권한이 없습니다.");
      console.error(error);
    }
  };

  const toggleExpand = useCallback(
    (id) => setExpandedLogId((prev) => (prev === id ? null : id)),
    [],
  );

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (levelFilter !== "ALL")
      result = result.filter((log) => log.level === levelFilter);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((log) =>
        log.message.toLowerCase().includes(lower),
      );
    }
    return result;
  }, [logs, levelFilter, searchTerm]);

  return (
    <Container>
      <LogHeader
        levelFilter={levelFilter}
        onFilterChange={(e) => setLevelFilter(e.target.value)}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />
      <LogTableComponent
        logs={filteredLogs}
        expandedLogId={expandedLogId}
        onToggleExpand={toggleExpand}
        editingMap={editingMap}
        setEditingMap={setEditingMap}
        startEdit={startEdit}
        saveEdit={saveEdit}
      />
    </Container>
  );
};

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
    font-family: "Consolas", monospace;
    font-size: 13px;
    color: #555;
  }
  .category {
    font-weight: 600;
    font-size: 12px;
    color: #2c3e50;
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
  font-family: "Consolas", monospace;
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
const IconBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: all 0.15s ease;
  &:hover {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  svg {
    font-size: 14px;
  }
`;

export default LogsPage;
