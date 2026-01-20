// src/pages/resource/MachinePage.js
import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
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
  FaPlus, // 추가
  FaEdit, // 추가
  FaTrash, // 추가
  FaTimes, // 추가
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_MACHINES = [
  {
    id: "EQ-PHO-01",
    name: "Photo Stepper #01 (ASML)",
    type: "Photo",
    status: "RUN",
    lotId: "LOT-DDR5-240601-A",
    uph: 140,
    temperature: 23.5,
    param: "Focus: 0.05um",
    progress: 82,
  },
  {
    id: "EQ-ETC-03",
    name: "Poly Etcher #03 (Lam)",
    type: "Etch",
    status: "RUN",
    lotId: "LOT-DDR5-240601-B",
    uph: 55,
    temperature: 65,
    param: "Gas: 450sccm",
    progress: 45,
  },
  {
    id: "EQ-DEP-02",
    name: "CVD Deposition #02",
    type: "Deposition",
    status: "DOWN",
    errorCode: "ERR-503: Gas Flow Low",
    lotId: "LOT-DDR5-240601-C",
    uph: 0,
    temperature: 450,
    param: "Vac: 2.1Torr",
    progress: 12,
  },
  {
    id: "EQ-EDS-01",
    name: "EDS Tester #01 (Advantest)",
    type: "Test",
    status: "RUN",
    lotId: "LOT-DDR5-TEST-09",
    uph: 3,
    temperature: 85,
    param: "Yield: 98.2%",
    progress: 98,
  },
];

const MachinePage = () => {
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null); // 수정 시 대상 객체, 추가 시 null
  const [formData, setFormData] = useState({
    name: "",
    type: "Photo",
    status: "IDLE",
    lotId: "-",
    uph: 0,
    temperature: 20,
    param: "-",
  });

  // 데이터 로딩 시뮬레이션 (최초 1회만)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // --- CRUD Handlers ---

  // 1. 추가 버튼 클릭
  const handleAddClick = () => {
    setEditingMachine(null); // 추가 모드
    setFormData({
      name: "",
      type: "Photo",
      status: "IDLE",
      lotId: "-",
      uph: 0,
      temperature: 20,
      param: "-",
    });
    setIsModalOpen(true);
  };

  // 2. 수정 버튼 클릭
  const handleEditClick = (machine) => {
    setEditingMachine(machine); // 수정 모드
    setFormData({ ...machine });
    setIsModalOpen(true);
  };

  // 3. 삭제 버튼 클릭
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      setMachines((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // 4. 저장 (추가/수정 반영)
  const handleSave = () => {
    if (!formData.name) {
      alert("Please enter machine name.");
      return;
    }

    if (editingMachine) {
      // 수정 로직
      setMachines((prev) =>
        prev.map((m) =>
          m.id === editingMachine.id ? { ...formData, id: m.id } : m,
        ),
      );
    } else {
      // 추가 로직
      const newId = `EQ-${formData.type.substring(0, 3).toUpperCase()}-${Math.floor(
        Math.random() * 100,
      )}`;
      const newMachine = {
        ...formData,
        id: newId,
        progress: 0, // 초기값
      };
      setMachines((prev) => [newMachine, ...prev]);
    }
    setIsModalOpen(false);
  };

  // 모달 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 필터링
  const filteredData = machines.filter((item) => {
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // 상태 카운트 계산
  const statusCounts = {
    TOTAL: machines.length,
    RUN: machines.filter((m) => m.status === "RUN").length,
    DOWN: machines.filter((m) => m.status === "DOWN").length,
    IDLE: machines.filter((m) => m.status === "IDLE").length,
  };

  return (
    <Container>
      {/* 1. 상단 요약 바 */}
      <SummaryBar>
        <SummaryItem
          onClick={() => setFilterStatus("ALL")}
          $active={filterStatus === "ALL"}
        >
          <Label>Total Equipments</Label>
          <Value>{statusCounts.TOTAL}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("RUN")}
          $active={filterStatus === "RUN"}
          $color="#2ecc71"
        >
          <Label>Running (Prod)</Label>
          <Value>{statusCounts.RUN}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("IDLE")}
          $active={filterStatus === "IDLE"}
          $color="#f1c40f"
        >
          <Label>Idle / Standby</Label>
          <Value>{statusCounts.IDLE}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("DOWN")}
          $active={filterStatus === "DOWN"}
          $color="#e74c3c"
        >
          <Label>Down / Trouble</Label>
          <Value>{statusCounts.DOWN}</Value>
        </SummaryItem>
      </SummaryBar>

      {/* 2. 컨트롤 영역 */}
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
          <AddButton onClick={handleAddClick}>
            <FaPlus /> Add Equipment
          </AddButton>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search EQ ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </FilterGroup>
      </ControlSection>

      {/* 3. 설비 카드 그리드 */}
      <GridContainer>
        {filteredData.map((machine) => (
          <MachineCard key={machine.id} $status={machine.status}>
            <CardHeader $status={machine.status}>
              <MachineName>
                <FaMicrochip /> {machine.name}
              </MachineName>
              <HeaderActions>
                <StatusBadge $status={machine.status}>
                  {machine.status === "RUN" && <FaPlay size={10} />}
                  {machine.status === "IDLE" && <FaStop size={10} />}
                  {machine.status === "DOWN" && (
                    <FaExclamationTriangle size={10} />
                  )}
                  {machine.status === "PM" && <FaTools size={10} />}
                  <span>{machine.status}</span>
                </StatusBadge>
                {/* 수정/삭제 아이콘 */}
                <ActionIcon onClick={() => handleEditClick(machine)}>
                  <FaEdit />
                </ActionIcon>
                <ActionIcon
                  className="del"
                  onClick={() => handleDeleteClick(machine.id)}
                >
                  <FaTrash />
                </ActionIcon>
              </HeaderActions>
            </CardHeader>

            <CardBody>
              <InfoRow>
                <InfoLabel>Current Lot</InfoLabel>
                <InfoValue className="lot">{machine.lotId}</InfoValue>
              </InfoRow>

              <MetricGrid>
                <MetricItem>
                  <FaBolt color="#f1c40f" />
                  <span>{machine.uph} WPH</span>
                </MetricItem>
                <MetricItem>
                  <FaThermometerHalf color="#e74c3c" />
                  <span>{machine.temperature}°C</span>
                </MetricItem>
              </MetricGrid>

              <ParamRow>
                <ParamLabel>Main Param:</ParamLabel>
                <ParamValue>{machine.param}</ParamValue>
              </ParamRow>

              {machine.status === "DOWN" ? (
                <ErrorBox>
                  <FaExclamationTriangle />{" "}
                  {machine.errorCode || "Unknown Error"}
                </ErrorBox>
              ) : (
                <ProgressWrapper>
                  <ProgressLabel>
                    <span>Process Progress</span>
                    <span>{machine.progress}%</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill
                      $percent={machine.progress}
                      $status={machine.status}
                    />
                  </ProgressBar>
                </ProgressWrapper>
              )}
            </CardBody>

            <CardFooter>
              <DetailButton>View Detail / Log</DetailButton>
            </CardFooter>
          </MachineCard>
        ))}
      </GridContainer>

      {/* --- Add/Edit Modal --- */}
      {isModalOpen && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editingMachine ? "Edit Equipment" : "Add New Equipment"}</h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <label>Equipment Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Photo Stepper #05"
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Photo">Photo</option>
                    <option value="Etch">Etch</option>
                    <option value="Deposition">Deposition</option>
                    <option value="Test">Test</option>
                    <option value="CMP">CMP</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="IDLE">IDLE</option>
                    <option value="RUN">RUN</option>
                    <option value="DOWN">DOWN</option>
                    <option value="PM">PM</option>
                  </select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label>Current Lot ID</label>
                <input
                  name="lotId"
                  value={formData.lotId}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label>UPH (WPH)</label>
                  <input
                    type="number"
                    name="uph"
                    value={formData.uph}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label>Temp (°C)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label>Main Parameter</label>
                <input
                  name="param"
                  value={formData.param}
                  onChange={handleInputChange}
                  placeholder="e.g. Focus: 0.05um"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelBtn onClick={() => setIsModalOpen(false)}>
                Cancel
              </CancelBtn>
              <SaveBtn onClick={handleSave}>Save Changes</SaveBtn>
            </ModalFooter>
          </ModalContent>
        </Overlay>
      )}
    </Container>
  );
};

export default MachinePage;

// --- Styled Components ---

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
const AddButton = styled.button`
  background-color: #1a4f8b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #153e6d;
  }
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

const ActionIcon = styled.div`
  cursor: pointer;
  color: #666;
  font-size: 14px;
  &:hover {
    color: #1a4f8b;
  }
  &.del:hover {
    color: #e74c3c;
  }
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

// --- Modal Styles ---
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
const ModalContent = styled.div`
  background: white;
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;
const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;
const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const FormRow = styled.div`
  display: flex;
  gap: 15px;
`;
const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    font-size: 13px;
    font-weight: 600;
    color: #555;
  }
  input,
  select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    &:focus {
      border-color: #1a4f8b;
    }
  }
`;
const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const CancelBtn = styled.button`
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  &:hover {
    background: #eee;
  }
`;
const SaveBtn = styled.button`
  background: #1a4f8b;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  &:hover {
    background: #153e6d;
  }
`;
