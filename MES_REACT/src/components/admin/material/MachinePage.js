// src/pages/resource/MachinePage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaSearch,
  FaThermometerHalf,
  FaBolt,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaTools,
  FaMicrochip,
  FaSync,
  FaTimes,
  FaClipboardList,
  FaInfoCircle,
} from "react-icons/fa";

// --- [Optimized] Sub-Components with React.memo ---

// 1. Summary Section
const SummaryBoard = React.memo(({ counts, filterStatus, onFilterChange }) => {
  return (
    <SummaryBar>
      <SummaryItem
        onClick={() => onFilterChange("ALL")}
        $active={filterStatus === "ALL"}
      >
        <Label>Total Equipments</Label>
        <Value>{counts.TOTAL}</Value>
      </SummaryItem>

      <SummaryItem
        onClick={() => onFilterChange("RUN")}
        $active={filterStatus === "RUN"}
        $color="#2ecc71"
      >
        <Label>Running (Prod)</Label>
        <Value>{counts.RUN}</Value>
      </SummaryItem>

      <SummaryItem
        onClick={() => onFilterChange("IDLE")}
        $active={filterStatus === "IDLE"}
        $color="#f1c40f"
      >
        <Label>Idle / Standby</Label>
        <Value>{counts.IDLE}</Value>
      </SummaryItem>

      <SummaryItem
        onClick={() => onFilterChange("DOWN")}
        $active={filterStatus === "DOWN"}
        $color="#e74c3c"
      >
        <Label>Down / Trouble</Label>
        <Value>{counts.DOWN}</Value>
      </SummaryItem>
    </SummaryBar>
  );
});

// 2. Control Bar Section
const ControlBar = React.memo(
  ({ loading, searchTerm, onSearchChange, onRefresh }) => {
    return (
      <ControlSection>
        <Title>
          Fab Equipment Monitoring
          {loading && (
            <LoadingSpinner>
              <FaSync className="spin" />
            </LoadingSpinner>
          )}
        </Title>

        <FilterGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search EQ ID..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>

          <RefreshBtn onClick={onRefresh} title="Refresh">
            <FaSync />
          </RefreshBtn>
        </FilterGroup>
      </ControlSection>
    );
  },
);

// 3. Machine Card Item
const MachineCardItem = React.memo(({ machine, onDetail, onStatusChange }) => {
  return (
    <MachineCard $status={machine.status}>
      <CardHeader $status={machine.status}>
        <MachineName>
          <FaMicrochip /> {machine.name}
        </MachineName>

        <HeaderActions>
          <StatusBadge $status={machine.status}>
            {machine.status === "RUN" && <FaPlay size={10} />}
            {machine.status === "IDLE" && <FaStop size={10} />}
            {machine.status === "DOWN" && <FaExclamationTriangle size={10} />}
            {machine.status === "PM" && <FaTools size={10} />}
            <span>{machine.status}</span>
          </StatusBadge>
        </HeaderActions>
      </CardHeader>

      <CardBody>
        <InfoRow>
          <InfoLabel>Current Lot</InfoLabel>
          <InfoValue className="lot">{machine.lotId ?? "-"}</InfoValue>
        </InfoRow>

        <MetricGrid>
          <MetricItem>
            <FaBolt color="#f1c40f" />
            <span>{machine.uph ?? 0} WPH</span>
          </MetricItem>
          <MetricItem>
            <FaThermometerHalf color="#e74c3c" />
            <span>{machine.temperature ?? 0}°C</span>
          </MetricItem>
        </MetricGrid>

        <ParamRow>
          <ParamLabel>Main Param:</ParamLabel>
          <ParamValue>{machine.param ?? "-"}</ParamValue>
        </ParamRow>

        {machine.status === "DOWN" ? (
          <ErrorBox>
            <FaExclamationTriangle />
            {machine.errorCode || "Unknown Error"}
          </ErrorBox>
        ) : (
          <ProgressWrapper>
            <ProgressLabel>
              <span>Process Progress</span>
              <span>{machine.progress ?? 0}%</span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill
                $percent={machine.progress ?? 0}
                $status={machine.status}
              />
            </ProgressBar>
          </ProgressWrapper>
        )}

        {/* --- [Modified] Control Buttons --- */}
        <ControlGrid>
          {/* RUN 버튼 (초록색) */}
          <ControlBtn
            $type="RUN"
            // DOWN 또는 IDLE 상태일 때만 활성화 (현재 RUN이면 비활성화)
            disabled={machine.status === "RUN"}
            onClick={(e) => {
              e.stopPropagation();
              // DOWN이나 IDLE 상태에서 누르면 RUN으로 변경
              onStatusChange(machine.id, "RUN");
            }}
            title="가동 시작"
          >
            <FaPlay />
          </ControlBtn>

          {/* IDLE/STOP 버튼 (노란색) */}
          <ControlBtn
            $type="IDLE"
            // DOWN 상태에서는 더 이상 DOWN을 누를 필요가 없으므로 비활성화 가능 (선택사항)
            disabled={machine.status === "DOWN"}
            onClick={(e) => {
              e.stopPropagation();
              // 요청 사항: RUN 상태일 때 누르면 DOWN으로 변경
              if (machine.status === "RUN") {
                onStatusChange(machine.id, "DOWN");
              } else {
                // 그 외 상태(IDLE 등)에서 누를 경우 기본 IDLE 유지 또는 DOWN 처리
                onStatusChange(machine.id, "IDLE");
              }
            }}
            title="상태 변경"
          >
            <FaStop />
          </ControlBtn>
        </ControlGrid>
      </CardBody>

      <CardFooter>
        <DetailButton onClick={() => onDetail(machine)}>
          View Detail / Log
        </DetailButton>
      </CardFooter>
    </MachineCard>
  );
});

// 4. Machine Grid
const MachineGrid = React.memo(({ machines, onDetail, onStatusChange }) => {
  return (
    <GridContainer>
      {machines.map((machine) => (
        <MachineCardItem
          key={machine.id}
          machine={machine}
          onDetail={onDetail}
          onStatusChange={onStatusChange}
        />
      ))}
    </GridContainer>
  );
});

// 5. Detail Modal
const DetailModal = React.memo(({ target, logs, onClose }) => {
  if (!target) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaInfoCircle /> {target.name}
          </ModalTitle>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        <ModalBody>
          <SectionTitle>
            <FaMicrochip /> Equipment Detail
          </SectionTitle>

          <InfoGrid>
            <InfoItem>
              <InfoKey>Equipment ID</InfoKey>
              <InfoValueText>{target.id}</InfoValueText>
            </InfoItem>

            <InfoItem>
              <InfoKey>Status</InfoKey>
              <StatusChip $status={target.status}>{target.status}</StatusChip>
            </InfoItem>

            <InfoItem>
              <InfoKey>Type</InfoKey>
              <InfoValueText>{target.type ?? "-"}</InfoValueText>
            </InfoItem>

            <InfoItem>
              <InfoKey>Current Lot</InfoKey>
              <InfoValueText className="mono">
                {target.lotId ?? "-"}
              </InfoValueText>
            </InfoItem>

            <InfoItem>
              <InfoKey>UPH</InfoKey>
              <InfoValueText>{target.uph ?? 0}</InfoValueText>
            </InfoItem>

            <InfoItem>
              <InfoKey>Temperature</InfoKey>
              <InfoValueText>{target.temperature ?? 0}°C</InfoValueText>
            </InfoItem>

            <InfoItem style={{ gridColumn: "1 / -1" }}>
              <InfoKey>Main Param</InfoKey>
              <InfoValueText>{target.param ?? "-"}</InfoValueText>
            </InfoItem>
          </InfoGrid>

          {target.status === "DOWN" && (
            <DownAlarmBox>
              <FaExclamationTriangle />
              <span>{target.errorCode ?? "Trouble Detected"}</span>
            </DownAlarmBox>
          )}

          <SectionTitle style={{ marginTop: 18 }}>
            <FaClipboardList /> Recent Logs
          </SectionTitle>

          <LogTable>
            <thead>
              <tr>
                <th width="170">Time</th>
                <th width="90">Type</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="mono">{log.time}</td>
                    <td>
                      <LogTypeBadge $type={log.type}>{log.type}</LogTypeBadge>
                    </td>
                    <td>{log.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", color: "#999" }}
                  >
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </LogTable>
        </ModalBody>

        <ModalFooter>
          <ModalBtn className="close" onClick={onClose}>
            Close
          </ModalBtn>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
});

const MachinePage = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [logs, setLogs] = useState([]);

  // ============================
  // 데이터 가져오기 (DB)
  // ============================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/mes/equipment/monitor`);
      setMachines(res.data ?? []);
    } catch (err) {
      console.error("설비 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // 로그조회 api
  const fetchEquipmentLogs = async (equipmentId) => {
    try {
      const res = await axiosInstance.get(
        `/api/mes/equipment/${equipmentId}/logs`,
      );
      setLogs(res.data ?? []);
    } catch (err) {
      console.error("로그 조회 실패:", err);
      setLogs([]);
    }
  };

  // ============================
  // Handlers
  // ============================
  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      try {
        // 1. UI 선반영 (Optimistic UI)
        setMachines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
        );

        // 2. 서버 요청 수정
        // - .post -> .patch 로 변경
        // - 데이터를 body가 아닌 params로 전달 (@RequestParam 대응)
        await axiosInstance.patch(`/api/mes/equipment/${id}/status`, null, {
          params: { status: newStatus },
        });

        console.log(`Equipment ${id} status changed to ${newStatus}`);
      } catch (err) {
        console.error("상태 변경 실패:", err);
        alert("권한이 없거나 상태 변경에 실패했습니다.");
        // 실패 시 데이터 다시 불러오기 (원복)
        fetchData();
      }
    },
    [fetchData],
  );

  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const openDetailModal = useCallback(async (machine) => {
    setDetailTarget(machine);
    setDetailOpen(true);

    await fetchEquipmentLogs(machine.id);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailOpen(false);
    setDetailTarget(null);
    setLogs([]); // 모달 닫을 때 로그 비우기
  }, []);

  const filteredData = useMemo(() => {
    return machines.filter((item) => {
      const matchStatus =
        filterStatus === "ALL" || item.status === filterStatus;
      const matchSearch =
        (item.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [machines, filterStatus, searchTerm]);

  const statusCounts = useMemo(() => {
    return {
      TOTAL: machines.length,
      RUN: machines.filter((m) => m.status === "RUN").length,
      DOWN: machines.filter((m) => m.status === "DOWN").length,
      IDLE: machines.filter((m) => m.status === "IDLE").length,
    };
  }, [machines]);

  return (
    <Container>
      <SummaryBoard
        counts={statusCounts}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
      />

      <ControlBar
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={fetchData}
      />

      <MachineGrid
        machines={filteredData}
        onDetail={openDetailModal}
        onStatusChange={handleStatusChange}
      />

      {detailOpen && (
        <DetailModal
          target={detailTarget}
          logs={logs}
          onClose={closeDetailModal}
        />
      )}
    </Container>
  );
};

export default MachinePage;

/* ===========================
   Styled Components
=========================== */

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
`;

/* Summary Bar */
const SummaryBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const SummaryItem = styled.div`
  flex: 1;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border-left: 4px solid ${(props) => props.$color || "#1a4f8b"};
  transition: all 0.2s;
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  transform: ${(props) => (props.$active ? "translateY(-2px)" : "none")};
  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
`;
const Label = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
`;
const Value = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #333;
`;

/* Control Bar */
const ControlSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const LoadingSpinner = styled.span`
  font-size: 16px;
  color: #1a4f8b;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  input {
    border: none;
    outline: none;
    margin-left: 10px;
    font-size: 14px;
  }
`;
const RefreshBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  &:hover {
    background: #f9f9f9;
  }
`;

/* Grid */
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
`;

const blink = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); border-color: #e74c3c; }
  50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); border-color: #ff8a80; }
  100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); border-color: #e74c3c; }
`;

const MachineCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  border: 1px solid #eee;
  ${(props) =>
    props.$status === "DOWN" &&
    css`
      animation: ${blink} 1.5s infinite;
    `}
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 15px;
  background-color: ${(props) =>
    props.$status === "RUN"
      ? "#e8f5e9"
      : props.$status === "DOWN"
        ? "#ffebee"
        : props.$status === "IDLE"
          ? "#fff8e1"
          : "#f5f5f5"};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const MachineName = styled.div`
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
`;
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: white;
  margin-right: 5px;
  color: ${(props) =>
    props.$status === "RUN"
      ? "#2ecc71"
      : props.$status === "DOWN"
        ? "#e74c3c"
        : props.$status === "IDLE"
          ? "#f1c40f"
          : "#95a5a6"};
`;

const CardBody = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const InfoLabel = styled.span`
  font-size: 13px;
  color: #888;
`;
const InfoValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
  &.lot {
    color: #1a4f8b;
    font-family: monospace;
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background-color: #fafafa;
  padding: 10px;
  border-radius: 8px;
`;
const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  font-weight: 600;
`;
const ParamRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-top: -5px;
`;
const ParamLabel = styled.span`
  color: #888;
`;
const ParamValue = styled.span`
  color: #555;
  font-weight: 600;
`;
const ErrorBox = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #ef9a9a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background-color: ${(props) =>
    props.$status === "RUN" ? "#2ecc71" : "#f1c40f"};
  transition: width 0.3s ease;
`;

/* Control Buttons Grid (Modified) */
const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 buttons: Run / Stop */
  gap: 8px;
  margin-top: 10px;
`;

const ControlBtn = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  color: white; /* Always white text/icon */

  /* Type specific styles */
  ${(props) =>
    props.$type === "RUN" &&
    `
    background-color: #2ecc71; /* Green */
    &:hover:not(:disabled) { background-color: #27ae60; }
  `}

  ${(props) =>
    props.$type === "IDLE" &&
    `
    background-color: #f1c40f; /* Yellow/Orange */
    &:hover:not(:disabled) { background-color: #f39c12; }
  `}

  /* Disabled state (when active) */
  &:disabled {
    cursor: default;
    opacity: 1; /* Keep full opacity to show it's active status */
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.15); /* Pressed effect */
  }
`;

const CardFooter = styled.div`
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: center;
`;
const DetailButton = styled.button`
  width: 100%;
  padding: 8px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #1a4f8b;
    color: white;
    border-color: #1a4f8b;
  }
`;

/* Modal Styles */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
const ModalBox = styled.div`
  width: 760px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;
const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const CloseBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #888;
  &:hover {
    color: #333;
  }
`;
const ModalBody = styled.div`
  padding: 14px 0;
  overflow-y: auto;
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
const InfoItem = styled.div`
  background: #f9fafb;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
`;
const InfoKey = styled.div`
  font-size: 11px;
  color: #888;
  font-weight: 700;
  margin-bottom: 6px;
`;
const InfoValueText = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 700;
  &.mono {
    font-family: monospace;
    color: #1a4f8b;
  }
`;
const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 13px;
  th {
    text-align: left;
    background: #f3f4f6;
    padding: 10px;
    color: #555;
    font-size: 12px;
    border-bottom: 1px solid #eee;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #eee;
    color: #333;
    vertical-align: middle;
  }
  .mono {
    font-family: monospace;
    color: #444;
  }
`;
const LogTypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  background: ${(props) =>
    props.$type === "ALARM"
      ? "#ffebee"
      : props.$type === "RUN"
        ? "#e8f5e9"
        : "#eef2ff"};
  color: ${(props) =>
    props.$type === "ALARM"
      ? "#c62828"
      : props.$type === "RUN"
        ? "#2e7d32"
        : "#3f51b5"};
`;
const ModalFooter = styled.div`
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;
const ModalBtn = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;
  &.close {
    background: #1a4f8b;
    color: white;
  }
  &:hover {
    opacity: 0.9;
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #1a4f8b;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  width: fit-content;

  background: ${(props) =>
    props.$status === "RUN"
      ? "#e8f5e9"
      : props.$status === "DOWN"
        ? "#ffebee"
        : props.$status === "IDLE"
          ? "#fff8e1"
          : "#eee"};

  color: ${(props) =>
    props.$status === "RUN"
      ? "#2ecc71"
      : props.$status === "DOWN"
        ? "#e74c3c"
        : props.$status === "IDLE"
          ? "#f1c40f"
          : "#777"};
`;

const DownAlarmBox = styled.div`
  margin-top: 12px;
  background: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
`;
