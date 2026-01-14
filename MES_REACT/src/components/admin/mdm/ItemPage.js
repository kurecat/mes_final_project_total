// src/pages/mdm/ItemPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBarcode,
  FaTimes,
  FaSave,
  FaFilter,
} from "react-icons/fa";

// --- Mock Data (HBM 관련 품목 마스터) ---
const INITIAL_ITEMS = [
  {
    code: "RM-WF-001",
    name: "12-inch Si Wafer (TSV)",
    type: "RAW", // RAW, WIP, PROD, SUB
    spec: "300mm, P-Type",
    unit: "ea",
    safetyStock: 100,
    cost: 500,
    status: "ACTIVE", // ACTIVE, INACTIVE
    description: "TSV 공정용 베어 웨이퍼",
  },
  {
    code: "CH-UF-023",
    name: "NCP Underfill Epoxy",
    type: "SUB",
    spec: "MUF-Series Type-C",
    unit: "btl", // Bottle
    safetyStock: 20,
    cost: 120,
    status: "ACTIVE",
    description: "비전도성 접착 필름용 액상 재료",
  },
  {
    code: "WP-ST-301",
    name: "8-Hi Stacked Die",
    type: "WIP",
    spec: "HBM3 Core Die x8",
    unit: "ea",
    safetyStock: 50,
    cost: 0, // 재공품은 원가 계산 별도
    status: "ACTIVE",
    description: "적층 완료된 중간 반제품",
  },
  {
    code: "FG-HBM3-16G",
    name: "HBM3 16GB Module",
    type: "PROD",
    spec: "KGSD, JEDEC Standard",
    unit: "ea",
    safetyStock: 200,
    cost: 4500,
    status: "ACTIVE",
    description: "최종 완제품",
  },
  {
    code: "RM-BM-005",
    name: "Micro Bump (SnAg)",
    type: "RAW",
    spec: "20um Pitch",
    unit: "ea",
    safetyStock: 10000,
    cost: 0.5,
    status: "INACTIVE", // 사용 중지
    description: "구형 범프 자재",
  },
];

const ItemPage = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // 필터링 로직
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // 모달 열기 (추가/수정)
  const openModal = (item = null) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        code: "",
        name: "",
        type: "RAW",
        spec: "",
        unit: "ea",
        safetyStock: 0,
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  // 저장 핸들러
  const handleSave = (e) => {
    e.preventDefault();
    if (isEditMode) {
      // 수정 로직 (Mock)
      setItems(
        items.map((it) => (it.code === currentItem.code ? currentItem : it))
      );
    } else {
      // 추가 로직 (Mock)
      setItems([...items, currentItem]);
    }
    closeModal();
  };

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  return (
    <Container>
      {/* 1. 헤더 및 컨트롤 바 */}
      <HeaderSection>
        <PageTitle>Item Master Management</PageTitle>
        <ControlBar>
          <SearchGroup>
            <SearchBox>
              <FaSearch color="#999" />
              <input
                placeholder="Search Item Code or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            <FilterSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="RAW">Raw Material (원자재)</option>
              <option value="SUB">Sub Material (부자재)</option>
              <option value="WIP">WIP (반제품)</option>
              <option value="PROD">Product (완제품)</option>
            </FilterSelect>
          </SearchGroup>
          <AddButton onClick={() => openModal()}>
            <FaPlus /> Add New Item
          </AddButton>
        </ControlBar>
      </HeaderSection>

      {/* 2. 품목 리스트 테이블 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="15%">Item Code</th>
              <th width="20%">Item Name</th>
              <th width="10%">Type</th>
              <th width="15%">Spec</th>
              <th width="8%">Unit</th>
              <th width="10%">Safety Stock</th>
              <th width="10%">Status</th>
              <th width="12%">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.code}>
                <td className="code">
                  <FaBarcode style={{ marginRight: 5, color: "#666" }} />
                  {item.code}
                </td>
                <td className="name">{item.name}</td>
                <td>
                  <TypeBadge $type={item.type}>{item.type}</TypeBadge>
                </td>
                <td>{item.spec}</td>
                <td>{item.unit}</td>
                <td style={{ textAlign: "right", paddingRight: 30 }}>
                  {item.safetyStock.toLocaleString()}
                </td>
                <td>
                  <StatusBadge $active={item.status === "ACTIVE"}>
                    {item.status}
                  </StatusBadge>
                </td>
                <td>
                  <ActionGroup>
                    <ActionButton onClick={() => openModal(item)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton $delete>
                      <FaTrash />
                    </ActionButton>
                  </ActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* 3. 등록/수정 모달 (Overlay & Popup) */}
      {isModalOpen && (
        <Overlay>
          <ModalBox>
            <ModalHeader>
              <h3>{isEditMode ? "Edit Item" : "New Item Registration"}</h3>
              <CloseBtn onClick={closeModal}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <Label>Item Code *</Label>
                  <Input
                    name="code"
                    value={currentItem.code}
                    onChange={handleInputChange}
                    disabled={isEditMode} // 수정 시 코드 변경 불가
                    placeholder="ex) RM-WF-001"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Item Name *</Label>
                  <Input
                    name="name"
                    value={currentItem.name}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Item Type</Label>
                  <Select
                    name="type"
                    value={currentItem.type}
                    onChange={handleInputChange}
                  >
                    <option value="RAW">Raw Material</option>
                    <option value="SUB">Sub Material</option>
                    <option value="WIP">WIP (Semi-finished)</option>
                    <option value="PROD">Finished Product</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Unit (단위)</Label>
                  <Input
                    name="unit"
                    value={currentItem.unit}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Specification (규격)</Label>
                <Input
                  name="spec"
                  value={currentItem.spec}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Safety Stock (안전재고)</Label>
                  <Input
                    type="number"
                    name="safetyStock"
                    value={currentItem.safetyStock}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Usage Status</Label>
                  <Select
                    name="status"
                    value={currentItem.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">Active (사용)</option>
                    <option value="INACTIVE">Inactive (중지)</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={currentItem.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={closeModal}>Cancel</Button>
              <Button $primary onClick={handleSave}>
                <FaSave /> Save Item
              </Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </Container>
  );
};

export default ItemPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  margin-bottom: 20px;
`;

const PageTitle = styled.h2`
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #333;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
  width: 300px;

  input {
    border: none;
    outline: none;
    margin-left: 10px;
    width: 100%;
    font-size: 14px;
  }
`;

const FilterSelect = styled.select`
  padding: 0 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  outline: none;
  cursor: pointer;
  color: #555;
`;

const AddButton = styled.button`
  background-color: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #133b6b;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background-color: #f1f3f5;
    position: sticky;
    top: 0;
    th {
      padding: 15px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #eee;
      &:hover {
        background-color: #f8fbff;
      }
    }
    td {
      padding: 12px 15px;
      color: #333;
      vertical-align: middle;

      &.code {
        font-family: monospace;
        color: #1a4f8b;
        font-weight: 600;
        display: flex;
        align-items: center;
      }
      &.name {
        font-weight: 600;
      }
    }
  }
`;

// 배지 스타일
const TypeBadge = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 700;

  background-color: ${(props) =>
    props.$type === "RAW"
      ? "#e3f2fd"
      : props.$type === "WIP"
      ? "#fff3e0"
      : props.$type === "PROD"
      ? "#e8f5e9"
      : "#f3e5f5"};

  color: ${(props) =>
    props.$type === "RAW"
      ? "#1976d2"
      : props.$type === "WIP"
      ? "#e67e22"
      : props.$type === "PROD"
      ? "#2e7d32"
      : "#7b1fa2"};
`;

const StatusBadge = styled.span`
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? "#e8f5e9" : "#ffebee")};
  color: ${(props) => (props.$active ? "#2e7d32" : "#c62828")};
  font-weight: 600;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  border: 1px solid #eee;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => (props.$delete ? "#e74c3c" : "#555")};

  &:hover {
    background: #f5f5f5;
    border-color: #ddd;
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

const ModalBox = styled.div`
  background: white;
  width: 600px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
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
  }
`;

const CloseBtn = styled.button`
  background: none;
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
  gap: 6px;
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
  outline: none;
  &:focus {
    border-color: #1a4f8b;
  }
  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  resize: vertical;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  background-color: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};

  &:hover {
    opacity: 0.9;
  }
`;
