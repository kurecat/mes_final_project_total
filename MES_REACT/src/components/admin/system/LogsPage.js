import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import api from "../../../api/axios";

// ★ PDF 관련 라이브러리
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// ★ 폰트 파일 import
import { fontBase64 } from "../../../fonts/NanumGothic";

import {
  FaServer,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBug,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// --- Helper & Sub-Components ---
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
    default:
      return (
        <Badge $color="#95a5a6" $bg="#f4f6f7">
          {level}
        </Badge>
      );
  }
};

const LogHeader = React.memo(
  ({ levelFilter, onFilterChange, searchTerm, onSearchChange, onExport }) => (
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
          </Select>
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#aaa" />
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
        <DownloadBtn onClick={onExport}>
          <FaDownload /> Export PDF
        </DownloadBtn>
      </Controls>
    </Header>
  ),
);

const LogTableRow = React.memo(({ log, isExpanded, onToggleExpand }) => (
  <>
    <LogRow
      $level={log.level}
      onClick={() => onToggleExpand(log.id)}
      $expanded={isExpanded}
    >
      <td className="mono">{log.timestamp}</td>
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
    {isExpanded && (
      <DetailRow>
        <td colSpan="7">
          <DetailBox>
            <div className="label">Log ID: {log.id}</div>
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </DetailBox>
        </td>
      </DetailRow>
    )}
  </>
));

const LogTableComponent = React.memo(
  ({ logs, expandedLogId, onToggleExpand }) => (
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
  ),
);

// --- Main Component ---

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    api
      .get("/api/mes/system/log")
      .then((res) => {
        const mappedData = res.data.map((item) => ({
          id: item.id,
          timestamp: new Date(item.loginTime).toLocaleString(),
          level: item.status === "SUCCESS" ? "INFO" : "WARN",
          category: "LOGIN",
          message: `Login ${item.status}`,
          userId: item.email,
          userIp: item.ipAddress,
          details: `Login attempt by ${item.email}`,
        }));
        setLogs(mappedData);
      })
      .catch((err) => console.error("Failed to fetch logs:", err));
  }, []);

  // ★ 1. filteredLogs를 먼저 정의해야 합니다! (useMemo를 위로 올림)
  const filteredLogs = useMemo(() => {
    let result = logs;
    if (levelFilter !== "ALL")
      result = result.filter((log) => log.level === levelFilter);
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(lowerTerm) ||
          log.userId.toLowerCase().includes(lowerTerm),
      );
    }
    return result;
  }, [logs, levelFilter, searchTerm]);

  // ★ PDF 다운로드 함수 (상세 내용 포함 버전)
  const handleExport = useCallback(() => {
    if (!filteredLogs || filteredLogs.length === 0) {
      alert("출력할 로그 데이터가 없습니다.");
      return;
    }

    const doc = new jsPDF();

    // 1. 폰트 등록
    doc.addFileToVFS("NanumGothic.ttf", fontBase64);
    doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
    doc.setFont("NanumGothic");

    // 2. 타이틀
    doc.setFontSize(18);
    doc.text("System Logs & Audit Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Filter Level: ${levelFilter}`, 14, 33);

    // 3. 테이블 컬럼 정의
    const tableColumn = ["Time", "Level", "Category", "Message", "User", "IP"];

    // 4. 테이블 행 데이터 생성 (메인 행 + 상세 행 결합)
    const tableRows = [];

    filteredLogs.forEach((log) => {
      // (1) 메인 정보 행 추가
      tableRows.push([
        log.timestamp,
        log.level,
        log.category,
        log.message,
        log.userId,
        log.userIp,
      ]);

      // (2) 상세 내용(JSON) 행 추가
      // 화면의 검은색 박스처럼 보이게 스타일링합니다.
      const detailString = JSON.stringify(
        {
          id: log.id,
          timestamp: log.timestamp,
          level: log.level,
          category: log.category,
          message: log.message,
          userId: log.userId,
          userIp: log.userIp,
          details: log.details,
        },
        null,
        2,
      ); // 보기 좋게 들여쓰기

      tableRows.push([
        {
          content: detailString,
          colSpan: 6, // 6개 컬럼을 합쳐서 한 줄로 표시
          styles: {
            fillColor: [44, 62, 80], // 다크 네이비 배경 (화면과 비슷하게)
            textColor: [236, 240, 241], // 밝은 글씨
            font: "NanumGothic", // 또는 'courier' (고정폭)
            fontSize: 8,
            cellPadding: 3,
            halign: "left", // 왼쪽 정렬
          },
        },
      ]);
    });

    // 5. autoTable 생성
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [52, 152, 219], // 헤더 색상 (밝은 파랑)
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        font: "NanumGothic",
        fontSize: 9,
        valign: "middle",
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 25 },
        3: { cellWidth: "auto" },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
      },
      // 메인 행의 Level 색상 처리 (ERROR 빨강 등)
      didParseCell: function (data) {
        // 상세 행(colSpan이 있는 행)이 아닐 때만 적용
        if (
          data.section === "body" &&
          data.column.index === 1 &&
          !data.row.raw[0].colSpan
        ) {
          const level = data.cell.raw;
          if (level === "ERROR") {
            data.cell.styles.textColor = [231, 76, 60];
            data.cell.styles.fontStyle = "bold";
          } else if (level === "WARN") {
            data.cell.styles.textColor = [243, 156, 18];
          }
        }
      },
    });

    doc.save(
      `System_Logs_Detailed_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }, [filteredLogs, levelFilter]);

  // 나머지 핸들러들
  const toggleExpand = useCallback(
    (id) => setExpandedLogId((prevId) => (prevId === id ? null : id)),
    [],
  );
  const handleFilterChange = useCallback(
    (e) => setLevelFilter(e.target.value),
    [],
  );
  const handleSearchChange = useCallback(
    (e) => setSearchTerm(e.target.value),
    [],
  );

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

// --- Styled Components (기존 코드 유지) ---

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
