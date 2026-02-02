// src/pages/resource/EquipmentPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axiosInstance from "../../api/axios";
import {
  FaServer,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaCircle,
  FaTimes, // 닫기 아이콘
  FaSave, // 저장 아이콘
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_EQUIPMENTS = [
  {
    id: "EQ-PHO-01",
    name: "Photo Stepper A",
    type: "PHOTO",
    model: "ASML-NXE",
    location: "Bay-01",
    status: "RUN",
    installDate: "2023-01-15",
  },
  {
    id: "EQ-ETC-02",
    name: "Poly Etcher B",
    type: "ETCH",
    model: "Lam-Kiyo",
    location: "Bay-03",
    status: "IDLE",
    installDate: "2023-02-20",
  },
  {
    id: "EQ-DEP-03",
    name: "CVD Deposition C",
    type: "DEPO",
    model: "AMAT-Producer",
    location: "Bay-05",
    status: "DOWN",
    installDate: "2022-11-10",
  },
];

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Section Component
const EquipmentHeader = React.memo(
  ({ loading, searchTerm, onSearchChange, onAddClick }) => {
    return (
      <Header>
        <TitleArea>
          <PageTitle>
            <FaServer /> Equipment Master
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Fab Equipment List & Status Management</SubTitle>
        </TitleArea>
        <ActionGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Eq ID or Name..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
          <AddButton onClick={onAddClick}>
            <FaPlus /> Add Equipment
          </AddButton>
        </ActionGroup>
      </Header>
    );
  },
);

// 2. Table Row Component
// [수정] onToggleStatus 제거
const EquipmentRow = React.memo(({ eq, onEdit, onDelete }) => {
  return (
    <tr>
      <td>
        {/* [수정] onClick 이벤트 제거 (단순 표시용) */}
        <StatusBadge $status={eq.status}>
          <FaCircle size={8} /> {eq.status}
        </StatusBadge>
      </td>
      <td style={{ fontWeight: "bold", color: "#1a4f8b" }}>{eq.id}</td>
      <td style={{ fontWeight: "600" }}>{eq.name}</td>
      <td>
        <TypeTag>{eq.type}</TypeTag>
      </td>
      <td>{eq.model}</td>
      <td>{eq.location}</td>
      <td style={{ color: "#666" }}>{eq.installDate}</td>
      <td className="center">
        <IconButton className="edit" onClick={() => onEdit(eq)}>
          <FaEdit />
        </IconButton>
        <IconButton className="del" onClick={() => onDelete(eq.id)}>
          <FaTrash />
        </IconButton>
      </td>
    </tr>
  );
});

// --- Main Component ---

const EquipmentPage = () => {
  const [equipments, setEquipments] = useState(MOCK_EQUIPMENTS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("ADD"); // "ADD" or "EDIT"
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "PHOTO",
    model: "",
    location: "",
    status: "IDLE",
    installDate: "",
  });

  // 1. 데이터 조회 (READ)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setEquipments(MOCK_EQUIPMENTS);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handlers - CRUD Logic

  // [수정] toggleStatus 함수 삭제됨

  // 삭제 핸들러
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`장비(${id})를 정말 삭제하시겠습니까?`)) return;
    try {
      setEquipments((prev) => prev.filter((eq) => eq.id !== id));
    } catch (err) {
      console.error("Delete Error", err);
    }
  }, []);

  // 검색 핸들러
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // --- Modal Handlers ---

  // 추가 버튼 클릭 (모달 열기)
  const handleAddClick = useCallback(() => {
    setFormData({
      id: "",
      name: "",
      type: "PHOTO",
      model: "",
      location: "",
      status: "IDLE",
      installDate: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
    });
    setModalMode("ADD");
    setIsModalOpen(true);
  }, []);

  // 수정 버튼 클릭 (모달 열기)
  const handleEditClick = useCallback((eq) => {
    setFormData({ ...eq }); // 선택된 객체 복사
    setModalMode("EDIT");
    setIsModalOpen(true);
  }, []);

  // 모달 닫기
  const handleCloseModal = () => setIsModalOpen(false);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 (Save / Update) 핸들러
  const handleSave = () => {
    // 유효성 검사 (간단)
    if (!formData.id || !formData.name) {
      alert("ID와 장비명은 필수입니다.");
      return;
    }

    if (modalMode === "ADD") {
      // ID 중복 체크
      if (equipments.some((eq) => eq.id === formData.id)) {
        alert("이미 존재하는 Equipment ID 입니다.");
        return;
      }
      // 추가 로직
      setEquipments((prev) => [formData, ...prev]);
    } else {
      // 수정 로직
      setEquipments((prev) =>
        prev.map((eq) => (eq.id === formData.id ? formData : eq)),
      );
    }
    setIsModalOpen(false);
  };

  // 3. Filtering
  const filteredList = useMemo(() => {
    return equipments.filter(
      (eq) =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [equipments, searchTerm]);

  return (
    <Container>
      {/* 헤더 */}
      <EquipmentHeader
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* 테이블 영역 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Equipment ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Model</th>
              <th>Location</th>
              <th>Install Date</th>
              <th className="center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((eq) => (
              <EquipmentRow
                key={eq.id}
                eq={eq}
                // onToggleStatus prop 제거됨
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* --- Modal UI --- */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>
                {modalMode === "ADD" ? "Add New Equipment" : "Edit Equipment"}
              </h3>
              <CloseBtn onClick={handleCloseModal}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <Label>Equipment ID</Label>
                  <Input
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g. EQ-PHO-05"
                    // 수정 모드일 때는 ID 변경 불가
                    readOnly={modalMode === "EDIT"}
                    disabled={modalMode === "EDIT"}
                    style={
                      modalMode === "EDIT" ? { background: "#f0f0f0" } : {}
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="PHOTO">PHOTO</option>
                    <option value="ETCH">ETCH</option>
                    <option value="DEPO">DEPO</option>
                    <option value="CMP">CMP</option>
                    <option value="IMP">IMP</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Equipment Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Photo Stepper NEW"
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Model</Label>
                  <Input
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g. ASML-NXE"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Location</Label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bay-09"
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Install Date</Label>
                  <Input
                    type="date"
                    name="installDate"
                    value={formData.installDate}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Initial Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="IDLE">IDLE</option>
                    <option value="RUN">RUN</option>
                    <option value="DOWN">DOWN</option>
                    <option value="PM">PM</option>
                  </Select>
                </FormGroup>
              </FormRow>
            </ModalBody>
            <ModalFooter>
              <CancelBtn onClick={handleCloseModal}>Cancel</CancelBtn>
              <SaveBtn onClick={handleSave}>
                <FaSave /> Save
              </SaveBtn>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default EquipmentPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
    color: #aaa;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 200px;
    font-size: 14px;
  }
`;
const AddButton = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  thead {
    th {
      text-align: left;
      padding: 12px;
      background: #f9f9f9;
      color: #666;
      border-bottom: 2px solid #eee;
      font-weight: 700;
    }
    th.center {
      text-align: center;
    }
  }
  tbody {
    tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
      &:hover {
        background: #f8fbff;
      }
    }
    td {
      padding: 12px;
      color: #333;
      vertical-align: middle;
    }
    td.center {
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
  }
`;

// [수정] 클릭 가능한 스타일(커서, hover 효과 등) 제거
const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  // cursor: pointer; // 삭제됨
  // user-select: none; // 삭제됨
  width: fit-content;
  background-color: ${(props) =>
    props.$status === "RUN"
      ? "#e8f5e9"
      : props.$status === "DOWN"
        ? "#ffebee"
        : "#fff3e0"};
  color: ${(props) =>
    props.$status === "RUN"
      ? "#2e7d32"
      : props.$status === "DOWN"
        ? "#c62828"
        : "#f39c12"};
  // transition: transform 0.1s; // 삭제됨
  // &:active { transform: scale(0.95); } // 삭제됨
`;

const TypeTag = styled.span`
  background: #f0f4f8;
  color: #555;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e1e4e8;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  &:hover {
    background: #f5f5f5;
  }
  &.edit:hover {
    color: #1a4f8b;
    border-color: #1a4f8b;
  }
  &.del:hover {
    color: #e74c3c;
    border-color: #e74c3c;
  }
`;

// --- Modal Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideDown 0.3s ease-out;
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #1a4f8b;
  }
  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  &:focus {
    outline: none;
    border-color: #1a4f8b;
  }
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const SaveBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #133b6b;
  }
`;

const CancelBtn = styled.button`
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;
