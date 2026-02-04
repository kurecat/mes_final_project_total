import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaServer,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaCircle,
  FaTimes,
  FaSave,
} from "react-icons/fa";

// --- Sub-Components ---

const EquipmentRow = React.memo(({ eq, onEdit, onDelete }) => {
  // 1. eq 객체에 저장된 날짜가 있으면 그것을 쓰고, 없으면 오늘 날짜 표시
  const displayDate = eq.installDate || "-";

  return (
    <tr>
      <td>
        <StatusBadge $status={eq.status}>
          <FaCircle size={8} /> {eq.status || "IDLE"}
        </StatusBadge>
      </td>
      <td style={{ fontWeight: "bold", color: "#1a4f8b" }}>{eq.code || "-"}</td>
      <td style={{ fontWeight: "600" }}>{eq.name || "-"}</td>
      <td>
        <TypeTag>{eq.type || "Total"}</TypeTag>
      </td>
      <td>{eq.location || "-"}</td>
      {/* 사용자가 선택하여 상태(State)에 저장된 날짜가 출력됨 */}
      <td style={{ color: "#666" }}>{displayDate}</td>
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
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("ADD");

  const [formData, setFormData] = useState({
    id: null,
    code: "",
    name: "",
    type: "PHOTO",
    location: "",
    status: "IDLE",
    installDate: "",
  });

  // =============================
  // 목록 조회 (진실의 원천)
  // =============================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/mes/equipment");
      setEquipments(res.data ?? []);
    } catch (err) {
      console.error("Data Load Failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =============================
  // 입력 핸들러
  // =============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =============================
  // 저장 (핵심 수정 지점)
  // =============================
  const handleSave = async () => {
    if (modalMode === "ADD" && (!formData.code || !formData.name)) {
      alert("Equipment Code와 장비명은 필수입니다.");
      return;
    }

    if (modalMode === "EDIT" && !formData.name) {
      alert("장비명은 필수입니다.");
      return;
    }

    try {
      if (modalMode === "ADD") {
        await axiosInstance.post("/api/mes/equipment", formData);
      } else {
        await axiosInstance.put(`/api/mes/equipment/${formData.id}`, formData);
      }

      // 🔥 서버 기준으로 다시 조회 (핵심)
      await fetchData();

      setIsModalOpen(false);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    }
  };

  // =============================
  // 삭제
  // =============================
  const handleDelete = useCallback(
    async (dbId) => {
      if (!window.confirm(`장비를 삭제하시겠습니까?`)) return;
      try {
        await axiosInstance.delete(`/api/mes/equipment/${dbId}`);
        await fetchData(); // 🔥 삭제 후도 동일
      } catch (err) {
        alert("삭제 실패");
      }
    },
    [fetchData],
  );

  // =============================
  // ADD / EDIT
  // =============================
  const handleAddClick = useCallback(() => {
    setFormData({
      id: null,
      code: "",
      name: "",
      type: "PHOTO",
      location: "",
      status: "IDLE",
      installDate: new Date().toISOString().split("T")[0],
    });
    setModalMode("ADD");
    setIsModalOpen(true);
  }, []);

  const handleEditClick = useCallback((eq) => {
    setFormData({
      id: eq.id,
      code: eq.code || "",
      name: eq.name || "",
      type: eq.type || "PHOTO",
      location: eq.location || "",
      status: eq.status || "IDLE",
      installDate: eq.installDate
        ? eq.installDate.substring(0, 10) // 🔥 YYYY-MM-DD 강제
        : "",
    });
    setModalMode("EDIT");
    setIsModalOpen(true);
  }, []);

  // =============================
  // 필터
  // =============================
  const filteredList = useMemo(() => {
    return equipments.filter(
      (eq) =>
        (eq.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.code ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [equipments, searchTerm]);
  // 창고 선택
  const LOCATION_OPTIONS = [
    { value: "WH-ALL-001", label: "WH-ALL-001 (통합 창고)" },
    { value: "WH-MAIN-001", label: "WH-MAIN-001 (메인 창고)" },
    { value: "WH-SUB-001", label: "WH-SUB-001 (보조 창고)" },
  ];

  return (
    <Container>
      <Header>
        <TitleArea>
          <PageTitle>
            <FaServer /> Equipment Master{" "}
            {loading && <FaSync className="spin" />}
          </PageTitle>
        </TitleArea>
        <ActionGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton onClick={handleAddClick}>
            <FaPlus /> Add Equipment
          </AddButton>
        </ActionGroup>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Equipment Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Install Date</th>
              <th className="center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((eq) => (
              <EquipmentRow
                key={eq.id || eq.code}
                eq={eq}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>
                {modalMode === "ADD" ? "Add Equipment" : "Edit Equipment"}
              </h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <Label>Equipment Code</Label>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    disabled={modalMode === "EDIT"}
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
                    <option value="PACKING">PACKING</option>
                  </Select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label>Equipment Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label>Location</Label>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Location --</option>
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="IDLE">IDLE</option>
                    <option value="RUN">RUN</option>
                    <option value="DOWN">DOWN</option>
                  </Select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label>Install Date</Label>
                {/* 캘린더에서 날짜를 선택하면 formData.installDate에 저장됩니다 */}
                <Input
                  type="date"
                  name="installDate"
                  value={formData.installDate}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelBtn onClick={() => setIsModalOpen(false)}>
                Cancel
              </CancelBtn>
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

// --- Styled Components (기존 유지) ---
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f5f6fa;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
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
    outline: none;
    margin-left: 8px;
    width: 200px;
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
`;
const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead th {
    text-align: left;
    padding: 12px;
    background: #f9f9f9;
    border-bottom: 2px solid #eee;
  }
  tbody td {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  .center {
    text-align: center;
  }
`;
const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${(p) =>
    p.$status === "RUN"
      ? "#e8f5e9"
      : p.$status === "DOWN"
        ? "#ffebee"
        : "#fff3e0"};
  color: ${(p) =>
    p.$status === "RUN"
      ? "#2e7d32"
      : p.$status === "DOWN"
        ? "#c62828"
        : "#f39c12"};
`;
const TypeTag = styled.span`
  background: #f0f4f8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
`;
const IconButton = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  margin: 0 2px;
  &:hover {
    color: #1a4f8b;
    border-color: #1a4f8b;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  width: 500px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
`;
const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
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
`;
const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
`;
const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
`;
const ModalFooter = styled.div`
  padding: 15px 20px;
  background: #f9f9f9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-radius: 0 0 12px 12px;
`;
const SaveBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;
const CancelBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
`;
