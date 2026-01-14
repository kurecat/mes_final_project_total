// src/pages/quality/StandardPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaClipboardCheck,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCopy,
  FaFileExport,
  FaSave,
  FaTimes,
} from "react-icons/fa";

// --- Mock Data ---

// 1. 검사 기준 마스터 목록 (제품/공정별 버전 관리)
const STANDARD_LIST = [
  {
    id: "STD-HBM3-FIN",
    product: "HBM3 8-Hi Stack Module",
    process: "Final Inspection",
    revision: "Rev 1.2",
    status: "ACTIVE", // ACTIVE, DRAFT, OBSOLETE
    updatedDate: "2024-05-15",
    writer: "Quality Mgr",
  },
  {
    id: "STD-HBM3-BND",
    product: "HBM3 8-Hi Stack Module",
    process: "TC Bonding",
    revision: "Rev 2.0",
    status: "ACTIVE",
    updatedDate: "2024-05-10",
    writer: "Eng. Kim",
  },
  {
    id: "STD-DDR5-SMT",
    product: "DDR5 32GB UDIMM",
    process: "SMT Reflow",
    revision: "Rev 0.9",
    status: "DRAFT",
    updatedDate: "2024-05-20",
    writer: "Eng. Lee",
  },
];

// 2. 검사 항목 상세 (Inspection Items)
const INSPECTION_ITEMS = [
  {
    id: 1,
    name: "Total Height",
    type: "VARIABLE",
    method: "Laser Sensor",
    unit: "um",
    lsl: 780,
    target: 800,
    usl: 820,
    desc: "패키지 전체 높이 측정",
  },
  {
    id: 2,
    name: "Bump Shear Strength",
    type: "VARIABLE",
    method: "Shear Tester",
    unit: "gf",
    lsl: 30,
    target: 45,
    usl: null,
    desc: "범프 전단 강도",
  },
  {
    id: 3,
    name: "Visual Scratch",
    type: "ATTRIBUTE",
    method: "AOI / Eye",
    unit: "-",
    lsl: null,
    target: null,
    usl: null,
    criteria: "No Scratch Visible",
    desc: "표면 스크래치 유무",
  },
  {
    id: 4,
    name: "Open/Short Test",
    type: "ATTRIBUTE",
    method: "Probe Station",
    unit: "-",
    lsl: null,
    target: null,
    usl: null,
    criteria: "Pass",
    desc: "전기적 도통 검사",
  },
  {
    id: 5,
    name: "Warpage",
    type: "VARIABLE",
    method: "Shadow Moiré",
    unit: "um",
    lsl: -50,
    target: 0,
    usl: 50,
    desc: "휨 발생 정도",
  },
];

const StandardPage = () => {
  const [selectedStd, setSelectedStd] = useState(STANDARD_LIST[0]);
  const [items, setItems] = useState(INSPECTION_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 새 항목 추가용 State
  const [newItem, setNewItem] = useState({
    name: "",
    type: "VARIABLE",
    method: "",
    unit: "",
    lsl: "",
    target: "",
    usl: "",
    criteria: "",
  });

  // 항목 삭제
  const handleDeleteItem = (id) => {
    if (window.confirm("Delete this inspection item?")) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  // 모달 핸들러
  const handleSaveItem = () => {
    setItems([...items, { ...newItem, id: Date.now() }]);
    setIsModalOpen(false);
    setNewItem({
      name: "",
      type: "VARIABLE",
      method: "",
      unit: "",
      lsl: "",
      target: "",
      usl: "",
      criteria: "",
    });
  };

  return (
    <Container>
      {/* 1. 좌측 사이드바: 기준서 목록 */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaClipboardCheck /> Inspection Standards
          </Title>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input placeholder="Search Product..." />
          </SearchBox>
          <AddButton>
            <FaPlus /> New Standard
          </AddButton>
        </SidebarHeader>

        <StdList>
          {STANDARD_LIST.map((std) => (
            <StdItem
              key={std.id}
              $active={selectedStd.id === std.id}
              onClick={() => setSelectedStd(std)}
            >
              <ItemTop>
                <ProdName>{std.product}</ProdName>
                <StatusBadge $status={std.status}>{std.status}</StatusBadge>
              </ItemTop>
              <ProcessName>{std.process}</ProcessName>
              <ItemMeta>
                {std.revision} | {std.updatedDate}
              </ItemMeta>
            </StdItem>
          ))}
        </StdList>
      </Sidebar>

      {/* 2. 우측 컨텐츠: 검사 항목 설정 */}
      <ContentArea>
        {selectedStd && (
          <>
            {/* 헤더 정보 */}
            <HeaderSection>
              <HeaderLeft>
                <HeaderTitle>
                  {selectedStd.product}{" "}
                  <SubText>({selectedStd.process})</SubText>
                </HeaderTitle>
                <MetaText>
                  Standard ID: <strong>{selectedStd.id}</strong> | Revision:{" "}
                  <strong>{selectedStd.revision}</strong>
                </MetaText>
              </HeaderLeft>
              <HeaderRight>
                <ActionButton>
                  <FaCopy /> Revision Up
                </ActionButton>
                <ActionButton $primary>
                  <FaSave /> Save All
                </ActionButton>
              </HeaderRight>
            </HeaderSection>

            {/* 검사 항목 테이블 */}
            <TableSection>
              <TableHeader>
                <SectionTitle>Inspection Items (Checklist)</SectionTitle>
                <SmallBtn onClick={() => setIsModalOpen(true)}>
                  <FaPlus /> Add Item
                </SmallBtn>
              </TableHeader>

              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <th width="5%">No</th>
                      <th width="20%">Inspection Item</th>
                      <th width="10%">Type</th>
                      <th width="15%">Method/Tool</th>
                      <th width="25%">Specification (LSL ~ USL)</th>
                      <th width="15%">Criteria (Qualitative)</th>
                      <th width="10%">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td align="center">{idx + 1}</td>
                        <td style={{ fontWeight: "600" }}>{item.name}</td>
                        <td>
                          <TypeTag $type={item.type}>{item.type}</TypeTag>
                        </td>
                        <td>{item.method}</td>
                        <td>
                          {item.type === "VARIABLE" ? (
                            <SpecBox>
                              <SpecVal>
                                {item.lsl ?? "-"} {item.unit}
                              </SpecVal>
                              <span style={{ color: "#999" }}>~</span>
                              <SpecVal>
                                {item.usl ?? "-"} {item.unit}
                              </SpecVal>
                              {item.target && (
                                <TargetVal>(Target: {item.target})</TargetVal>
                              )}
                            </SpecBox>
                          ) : (
                            <span style={{ color: "#ccc" }}>-</span>
                          )}
                        </td>
                        <td>
                          {item.type === "ATTRIBUTE" ? (
                            item.criteria
                          ) : (
                            <span style={{ color: "#ccc" }}>-</span>
                          )}
                        </td>
                        <td align="center">
                          <IconBtn onClick={() => handleDeleteItem(item.id)}>
                            <FaTrash />
                          </IconBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableSection>
          </>
        )}
      </ContentArea>

      {/* 3. 항목 추가 모달 */}
      {isModalOpen && (
        <Overlay>
          <ModalBox>
            <ModalHeader>
              <h3>Add New Inspection Item</h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Item Name</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="e.g. Thickness"
                />
              </FormGroup>
              <FormGroup>
                <Label>Data Type</Label>
                <Select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                >
                  <option value="VARIABLE">Variable (계량치 - 수치)</option>
                  <option value="ATTRIBUTE">Attribute (계수치 - 합불)</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Inspection Method</Label>
                <Input
                  value={newItem.method}
                  onChange={(e) =>
                    setNewItem({ ...newItem, method: e.target.value })
                  }
                  placeholder="e.g. Vernier Caliper"
                />
              </FormGroup>

              {newItem.type === "VARIABLE" ? (
                <Row>
                  <FormGroup>
                    <Label>LSL (Min)</Label>
                    <Input
                      type="number"
                      value={newItem.lsl}
                      onChange={(e) =>
                        setNewItem({ ...newItem, lsl: e.target.value })
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Target</Label>
                    <Input
                      type="number"
                      value={newItem.target}
                      onChange={(e) =>
                        setNewItem({ ...newItem, target: e.target.value })
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>USL (Max)</Label>
                    <Input
                      type="number"
                      value={newItem.usl}
                      onChange={(e) =>
                        setNewItem({ ...newItem, usl: e.target.value })
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Unit</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) =>
                        setNewItem({ ...newItem, unit: e.target.value })
                      }
                      placeholder="mm, V, etc."
                    />
                  </FormGroup>
                </Row>
              ) : (
                <FormGroup>
                  <Label>Pass Criteria</Label>
                  <Input
                    value={newItem.criteria}
                    onChange={(e) =>
                      setNewItem({ ...newItem, criteria: e.target.value })
                    }
                    placeholder="e.g. No Scratch, OK"
                  />
                </FormGroup>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button $primary onClick={handleSaveItem}>
                Add Item
              </Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </Container>
  );
};

export default StandardPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f6fa;
  box-sizing: border-box;
`;

// Sidebar
const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    width: 100%;
    outline: none;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    background: #133b6b;
  }
`;

const StdList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StdItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  background-color: ${(props) => (props.$active ? "#eef2f8" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ProdName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const ProcessName = styled.div`
  font-size: 13px;
  color: #555;
  margin-bottom: 5px;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #999;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "ACTIVE" ? "#e8f5e9" : "#eee"};
  color: ${(props) => (props.$status === "ACTIVE" ? "#2e7d32" : "#888")};
`;

// Content
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubText = styled.span`
  font-size: 16px;
  color: #666;
  font-weight: 400;
`;

const MetaText = styled.div`
  margin-top: 5px;
  font-size: 13px;
  color: #888;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  &:hover {
    opacity: 0.9;
  }
`;

// Table Section
const TableSection = styled.div`
  flex: 1;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0;
`;

const SmallBtn = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  &:hover {
    background: #f5f5f5;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
      padding: 12px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 12px;
      color: #333;
    }
  }
`;

const TypeTag = styled.span`
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 600;
  background-color: ${(props) =>
    props.$type === "VARIABLE" ? "#e3f2fd" : "#f3e5f5"};
  color: ${(props) => (props.$type === "VARIABLE" ? "#1976d2" : "#7b1fa2")};
`;

const SpecBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SpecVal = styled.span`
  font-weight: 600;
  color: #333;
`;

const TargetVal = styled.span`
  font-size: 12px;
  color: #888;
  margin-left: 5px;
`;

const IconBtn = styled.button`
  border: none;
  background: none;
  color: #ccc;
  cursor: pointer;
  &:hover {
    color: #e74c3c;
  }
`;

// Modal
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
  width: 500px;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalHeader = styled.div`
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
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
`;

const FormGroup = styled.div`
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

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
`;
