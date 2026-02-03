import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaServer,
  FaSearch,
  FaFilter,
  FaInfoCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
} from "react-icons/fa";

/* ===============================
   level 계산 (🔥 핵심)
================================ */
const resolveLevel = (log) => {
  if (log.category === "STATUS_CHANGE" && log.message.includes("RUN → DOWN")) {
    return "WARN";
  }
  return "INFO";
};

/* ===============================
   Badge
================================ */
const getLevelBadge = (level) => {
  if (level === "WARN") {
    return (
      <Badge $color="#f39c12" $bg="#fef5e7">
        <FaExclamationTriangle /> WARN
      </Badge>
    );
  }

  return (
    <Badge $color="#3498db" $bg="#ebf5fb">
      <FaInfoCircle /> INFO
    </Badge>
  );
};

/* ===============================
   Header
================================ */
const LogHeader = React.memo(
  ({ categoryFilter, onFilterChange, searchTerm, onSearchChange }) => (
    <Header>
      <TitleGroup>
        <FaServer size={22} color="#34495e" />
        <h1>Equipment Event Logs</h1>
      </TitleGroup>

      <Controls>
        <FilterGroup>
          <FaFilter color="#666" />
          <Select value={categoryFilter} onChange={onFilterChange}>
            <option value="ALL">All Events</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="TYPE_CHANGE">TYPE_CHANGE</option>
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

/* ===============================
   Table Row
================================ */
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
          $expanded={isExpanded}
          $level={log.level}
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
                <div className="label">Event Log ID: {log.id}</div>
                <pre>{JSON.stringify(log.raw, null, 2)}</pre>
              </DetailBox>
            </td>
          </DetailRow>
        )}
      </>
    );
  },
);

/* ===============================
   Table
================================ */
const LogTableComponent = React.memo((props) => (
  <TableContainer>
    <LogTable>
      <thead>
        <tr>
          <th width="180">Timestamp</th>
          <th width="100">Level</th>
          <th width="150">Event Type</th>
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

/* ===============================
   Page
================================ */
const EquipmentLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [editingMap, setEditingMap] = useState({});

  // ✅ 설비 로그 조회
  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/mes/equipment/logs");

      const mapped = res.data.map((item, idx) => {
        const log = {
          id: item.id,
          timestamp: item.time ? new Date(item.time).toLocaleString() : "-",
          category: item.type,
          message: item.message ?? "",
          raw: item,
        };

        return {
          ...log,
          level: resolveLevel(log),
        };
      });

      setLogs(mapped);
    } catch (err) {
      console.error("설비 로그 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const startEdit = (log) => {
    setEditingMap((prev) => ({ ...prev, [log.id]: log.message }));
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/api/mes/equipment/logs/${id}`, {
        message: editingMap[id],
      });

      setEditingMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      fetchLogs();
    } catch (e) {
      alert("수정 실패");
    }
  };

  const toggleExpand = useCallback(
    (id) => setExpandedLogId((prev) => (prev === id ? null : id)),
    [],
  );

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (categoryFilter !== "ALL") {
      result = result.filter((log) => log.category === categoryFilter);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((log) =>
        log.message.toLowerCase().includes(lower),
      );
    }

    return result;
  }, [logs, categoryFilter, searchTerm]);

  return (
    <Container>
      <LogHeader
        categoryFilter={categoryFilter}
        onFilterChange={(e) => setCategoryFilter(e.target.value)}
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

export default EquipmentLogsPage;

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
