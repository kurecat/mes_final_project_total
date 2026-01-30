// src/pages/facility/DowntimeHistoryPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaFileExcel,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaSave,
  FaTimes,
} from "react-icons/fa";

// --- Mock Data: 비가동 이력 데이터 ---
const MOCK_HISTORY = [
  {
    id: 101,
    equipId: "EQ-ETCH-02",
    equipName: "Dry Etcher B",
    type: "BREAKDOWN",
    reason: "RF Power Fluctuation",
    startTime: "2026-01-29 14:00",
    endTime: "-", // 아직 안 끝남 (OPEN)
    duration: "-",
    worker: "Kim",
    status: "OPEN",
    solution: "",
  },
  {
    id: 100,
    equipId: "EQ-CMP-03",
    equipName: "CMP Polisher",
    type: "MAINTENANCE",
    reason: "Slurry Nozzle Cleaning",
    startTime: "2026-01-28 09:00",
    endTime: "2026-01-28 11:30",
    duration: "150 min",
    worker: "Lee",
    status: "CLOSED",
    solution: "Nozzle replaced and cleaned",
  },
  {
    id: 99,
    equipId: "EQ-PHOTO-01",
    equipName: "Photo Stepper A",
    type: "IDLE",
    reason: "Mask Align Error",
    startTime: "2026-01-27 10:00",
    endTime: "2026-01-27 10:45",
    duration: "45 min",
    worker: "Park",
    status: "CLOSED",
    solution: "Re-calibration done",
  },
  {
    id: 98,
    equipId: "EQ-DEPO-01",
    equipName: "CVD Deposition",
    type: "QUALITY",
    reason: "Thickness OOC",
    startTime: "2026-01-26 15:20",
    endTime: "2026-01-26 16:00",
    duration: "40 min",
    worker: "Choi",
    status: "CLOSED",
    solution: "Chamber seasoning",
  },
];

// --- Helper: 시간 차이 계산 ---
const calculateDuration = (start, end) => {
  if (!start || !end || end === "-") return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  const diffMins = Math.floor(diffMs / 60000);
  return `${diffMins} min`;
};

// --- Sub-Components ---

// 1. Edit Modal (비가동 종료 처리 및 내용 수정)
const EditHistoryModal = ({ isOpen, onClose, log, onSave }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (isOpen && log) {
      setFormData({ ...log });
    }
  }, [isOpen, log]);

  if (!isOpen || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 종료 시간이 입력되었으면 자동으로 Duration 계산 및 Status 변경
    let updatedData = { ...formData };
    if (updatedData.endTime && updatedData.endTime !== "-") {
      updatedData.duration = calculateDuration(
        updatedData.startTime,
        updatedData.endTime,
      );
      updatedData.status = "CLOSED";
    }
    onSave(updatedData);
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalHeader>
          <h3>
            <FaEdit /> Edit Downtime Log (#{formData.id})
          </h3>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>
        <ModalBody>
          <InfoRow>
            <Label>Equipment</Label>
            <StaticValue>
              {formData.equipName} ({formData.equipId})
            </StaticValue>
          </InfoRow>

          <TwoCol>
            <InputGroup>
              <Label>Type</Label>
              <Select name="type" value={formData.type} onChange={handleChange}>
                <option value="BREAKDOWN">Breakdown</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IDLE">Idle</option>
                <option value="QUALITY">Quality</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Worker</Label>
              <Input
                name="worker"
                value={formData.worker}
                onChange={handleChange}
              />
            </InputGroup>
          </TwoCol>

          <InputGroup>
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              name="startTime"
              value={formData.startTime.replace(" ", "T")}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label>End Time (Set this to close)</Label>
            <Input
              type="datetime-local"
              name="endTime"
              value={
                formData.endTime === "-"
                  ? ""
                  : formData.endTime.replace(" ", "T")
              }
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label>Reason</Label>
            <Input
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label>Solution / Action Taken</Label>
            <TextArea
              rows="3"
              name="solution"
              value={formData.solution}
              onChange={handleChange}
              placeholder="Describe how the issue was resolved..."
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button $secondary onClick={onClose}>
            Cancel
          </Button>
          <Button $primary onClick={handleSave}>
            <FaSave /> Save & Close
          </Button>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
};

// --- Main Page Component ---
const DowntimeHistoryPage = () => {
  const [logs, setLogs] = useState(MOCK_HISTORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.equipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "ALL" || log.type === typeFilter;
      // Date filtering logic implies comparing strings or timestamps (simplified here)
      return matchSearch && matchType;
    });
  }, [logs, searchTerm, typeFilter]);

  const handleEditClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleSaveLog = (updatedLog) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === updatedLog.id ? updatedLog : log)),
    );
    setIsModalOpen(false);
  };

  const handleDeleteLog = (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      setLogs((prev) => prev.filter((log) => log.id !== id));
    }
  };

  return (
    <Container>
      {/* 1. Header */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaHistory /> Downtime History
          </PageTitle>
          <SubTitle>Manage Equipment Faults & Maintenance Logs</SubTitle>
        </TitleArea>
        <ExportBtn>
          <FaFileExcel /> Export to Excel
        </ExportBtn>
      </Header>

      {/* 2. Filter Bar */}
      <FilterBar>
        <FilterGroup>
          <FaSearch color="#999" />
          <SearchInput
            placeholder="Search Equipment or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FaFilter color="#999" />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="BREAKDOWN">Breakdown</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="IDLE">Idle</option>
            <option value="QUALITY">Quality</option>
          </Select>
        </FilterGroup>
        <DateGroup>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
          <span>~</span>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
        </DateGroup>
      </FilterBar>

      {/* 3. Data Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="5%">ID</th>
              <th width="8%">Status</th>
              <th width="15%">Equipment</th>
              <th width="10%">Type</th>
              <th>Reason & Solution</th>
              <th width="12%">Start Time</th>
              <th width="12%">End Time</th>
              <th width="8%">Duration</th>
              <th width="8%">Worker</th>
              <th width="10%">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ color: "#888" }}>#{log.id}</td>
                <td>
                  <StatusBadge $status={log.status}>
                    {log.status === "OPEN" ? (
                      <FaTimesCircle />
                    ) : (
                      <FaCheckCircle />
                    )}
                    {log.status}
                  </StatusBadge>
                </td>
                <td>
                  <EquipName>{log.equipName}</EquipName>
                  <EquipId>{log.equipId}</EquipId>
                </td>
                <td>
                  <TypeBadge $type={log.type}>{log.type}</TypeBadge>
                </td>
                <td>
                  <ReasonText>{log.reason}</ReasonText>
                  {log.solution && (
                    <SolutionText>↳ {log.solution}</SolutionText>
                  )}
                </td>
                <td>{log.startTime}</td>
                <td
                  style={{ color: log.endTime === "-" ? "#e74c3c" : "inherit" }}
                >
                  {log.endTime === "-" ? "Running..." : log.endTime}
                </td>
                <td style={{ fontWeight: "bold" }}>{log.duration}</td>
                <td>{log.worker}</td>
                <td>
                  <ActionGroup>
                    <IconBtn
                      onClick={() => handleEditClick(log)}
                      title="Edit / Close"
                    >
                      <FaEdit />
                    </IconBtn>
                    <IconBtn
                      $danger
                      onClick={() => handleDeleteLog(log.id)}
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </IconBtn>
                  </ActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <EditHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        log={selectedLog}
        onSave={handleSaveLog}
      />
    </Container>
  );
};

export default DowntimeHistoryPage;

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
  gap: 15px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
  margin-left: 32px;
`;
const ExportBtn = styled.button`
  background: #2e7d32;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #1b5e20;
  }
`;

const FilterBar = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;
const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 0 10px;
  border-radius: 6px;
  height: 36px;
`;
const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  margin-left: 8px;
  font-size: 13px;
  width: 200px;
`;
const Select = styled.select`
  border: none;
  background: transparent;
  outline: none;
  margin-left: 8px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
`;
const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    color: #888;
  }
`;
const Input = styled.input`
  border: 1px solid #ddd;
  padding: 0 10px;
  border-radius: 6px;
  height: 36px;
  font-size: 13px;
  outline: none;
  &:focus {
    border-color: #1a4f8b;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th {
    text-align: left;
    padding: 12px;
    background: #f9f9f9;
    color: #666;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
    vertical-align: top;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${(props) => (props.$status === "OPEN" ? "#ffebee" : "#e8f5e9")};
  color: ${(props) => (props.$status === "OPEN" ? "#c62828" : "#2e7d32")};
`;
const EquipName = styled.div`
  font-weight: 600;
  color: #333;
`;
const EquipId = styled.div`
  font-size: 11px;
  color: #888;
`;
const TypeBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #eee;
  background: ${(props) =>
    props.$type === "BREAKDOWN"
      ? "#fff3e0"
      : props.$type === "MAINTENANCE"
        ? "#e3f2fd"
        : "#f5f5f5"};
  color: ${(props) =>
    props.$type === "BREAKDOWN"
      ? "#e67e22"
      : props.$type === "MAINTENANCE"
        ? "#1565c0"
        : "#555"};
`;
const ReasonText = styled.div`
  font-size: 13px;
  color: #333;
`;
const SolutionText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;
const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const IconBtn = styled.button`
  border: 1px solid #eee;
  background: white;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => (props.$danger ? "#e74c3c" : "#1a4f8b")};
  &:hover {
    background: #f9f9f9;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalBox = styled.div`
  background: white;
  width: 500px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const ModalHeader = styled.div`
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
`;
const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const InfoRow = styled.div`
  margin-bottom: 10px;
`;
const StaticValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
`;
const TwoCol = styled.div`
  display: flex;
  gap: 15px;
`;
const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  &:focus {
    border-color: #1a4f8b;
  }
`;
const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fcfcfc;
`;
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    opacity: 0.9;
  }
`;
