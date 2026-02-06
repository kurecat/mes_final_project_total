import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styled from "styled-components";
import axiosInstance from "../../../api/axios.js";
import { fontBase64 } from "../../../fonts/NanumGothic.js";

// ★ PDF 관련 라이브러리 import
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FaSearch,
  FaSitemap,
  FaCube,
  FaCubes,
  FaMinus,
  FaEdit,
  FaFilePdf, // ★ 아이콘 변경 (Excel -> Pdf)
  FaFlask,
  FaMicrochip,
  FaSync,
  FaTools,
  FaTimes,
} from "react-icons/fa";

/* ... (Styled Components 들은 기존과 동일하므로 생략하지 않고 그대로 유지하거나, 
      이전 코드에 덮어씌우기 편하도록 전체 구조를 유지합니다.) ... */

// ... [상단 Styled Components 코드는 기존과 동일] ...
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  display: flex;
  box-sizing: border-box;
`;

const Sidebar = styled.div`
  width: 320px;
  max-height: calc(100vh - 140px);
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
  color: #333;
  margin: 0 0 15px 0;
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

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #eee;
  input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 100%;
    font-size: 14px;
  }
`;

const BomList = styled.div`
  flex: 0 1 auto;
  overflow-y: auto;
`;

const BomItem = styled.div`
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
  align-items: center;
  margin-bottom: 5px;
`;
const ItemName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;
const ItemBottom = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
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

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const HeaderLeft = styled.div``;
const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const BomName = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const RevBadge = styled.span`
  font-size: 12px;
  background-color: #333;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  vertical-align: middle;
`;
const BomMeta = styled.div`
  margin-top: 5px;
  font-size: 13px;
  color: #666;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background-color: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#333")};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
`;

const BomTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  thead {
    background-color: #f1f3f5;
    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #555;
      font-weight: 700;
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
      padding: 12px;
      font-size: 14px;
      color: #333;
      vertical-align: middle;
      &.name {
        font-weight: 600;
      }
    }
  }
`;

const RootRow = styled.tr`
  background-color: #fffde7 !important;
  font-weight: bold;
`;
const Indent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: ${(props) => (props.$level - 1) * 20}px;
`;
const LCorner = styled.div`
  width: 10px;
  height: 10px;
  border-left: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const TypeLabel = styled.span`
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "ASSY"
      ? "#fff3e0"
      : props.$type === "CHEM"
        ? "#ffebee"
        : props.$type === "FG"
          ? "#e8f5e9"
          : "#e3f2fd"};
  color: ${(props) =>
    props.$type === "ASSY"
      ? "#e67e22"
      : props.$type === "CHEM"
        ? "#c62828"
        : props.$type === "FG"
          ? "#2e7d32"
          : "#1976d2"};
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
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

const QuantityInput = styled.input`
  height: 30px;
  width: 60px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 12px;
  outline: none;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const MaterialSelect = styled.select`
  height: 34px;
  min-width: 160px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #1a4f8b;
    box-shadow: 0 0 0 2px rgba(26, 79, 139, 0.15);
  }

  option {
    font-size: 14px;
    padding: 6px;
  }
`;

/* =========================================================================
   Optimized Sub-Components
   ========================================================================= */

const SidebarItem = React.memo(({ bom, isActive, onClick }) => {
  return (
    <BomItem $active={isActive} onClick={() => onClick(bom)}>
      <ItemTop>
        <ItemName>{bom.productName}</ItemName>
        <StatusBadge $status={bom.status}>{bom.status}</StatusBadge>
      </ItemTop>
      <ItemBottom>
        <span>{bom.productCode}</span>
        <span>revision : {bom.revision}</span>
      </ItemBottom>
    </BomItem>
  );
});

const SidebarPanel = React.memo(
  ({
    loading,
    searchTerm,
    onSearchChange,
    filteredBoms,
    selectedBomId,
    onSelect,
  }) => {
    return (
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaSitemap /> Bom BOMs
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 12, marginLeft: 8 }}
              />
            )}
          </Title>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Bom..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
        </SidebarHeader>
        <BomList>
          <AnimatePresence>
            {filteredBoms.map((bom) => (
              <motion.div
                key={bom.id}
                layout
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
              >
                <SidebarItem
                  bom={bom}
                  isActive={selectedBomId === bom.id}
                  onClick={onSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </BomList>
      </Sidebar>
    );
  },
);

const BomTableRow = React.memo(({ bomItem, isEdit, onChange, onDelete }) => {
  return (
    <tr>
      <td style={{ textAlign: "center", color: "#888" }}>{1}</td>
      <td style={{ fontFamily: "monospace", color: "#555" }}>
        {bomItem.materialCode}
      </td>
      <td className="name">
        <Indent $level={1}>
          <LCorner />
          {bomItem.category === "CHEM" ? (
            <FaFlask color="#e74c3c" size={12} style={{ marginRight: 5 }} />
          ) : bomItem.category === "ASSY" ? (
            <FaMicrochip color="#f39c12" size={12} style={{ marginRight: 5 }} />
          ) : (
            <FaCube color="#3498db" size={12} style={{ marginRight: 5 }} />
          )}
          <span>{bomItem.materialName}</span>
        </Indent>
      </td>
      <td>
        <TypeLabel $type={bomItem.category}>{bomItem.category}</TypeLabel>
      </td>

      <td style={{ fontWeight: "600" }}>
        {!isEdit ? (
          bomItem.quantity
        ) : (
          <QuantityInput defaultValue={bomItem.quantity} onChange={onChange} />
        )}
      </td>
      <td style={{ color: "#666" }}>{bomItem.unit}</td>
      {isEdit && (
        <td>
          <ActionButton onClick={onDelete}>
            <FaMinus></FaMinus>
          </ActionButton>
        </td>
      )}
    </tr>
  );
});

// 4. Detail View Component (Memoized)
// ★ onExportPdf prop 추가
const DetailView = React.memo(
  ({ bom, bomItems, onClickRevisionChange, onExportPdf }) => {
    if (!bom) return <EmptyState>Select a Bom to view details</EmptyState>;

    return (
      <>
        <DetailHeader>
          <HeaderLeft>
            <BomName>
              {bom.productName} <RevBadge>{bom.revision}</RevBadge>
            </BomName>
            <BomMeta>
              Code: <strong>{bom.productCode}</strong>
              {/* | Type: {bom.type} */}| Last Updated:{" "}
              {new Date(bom.lastUpdate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </BomMeta>
          </HeaderLeft>
          <HeaderRight>
            {bom.status === "ACTIVE" && (
              <ActionButton onClick={onClickRevisionChange}>
                <FaEdit />
                Edit
              </ActionButton>
            )}
            {/* ★ 버튼 변경: Export PDF, 아이콘 변경, onClick 연결 */}
            <ActionButton $primary onClick={onExportPdf}>
              <FaFilePdf /> Export PDF
            </ActionButton>
          </HeaderRight>
        </DetailHeader>

        <TableContainer>
          <BomTable>
            <thead>
              <tr>
                <th width="5%">Lv.</th>
                <th width="25%">Material Code</th>
                <th width="25%">Material Name</th>
                <th width="5%">Type</th>
                <th width="5%">Qty</th>
                <th width="5%">Unit</th>
              </tr>
            </thead>
            <tbody>
              {/* Root Item */}
              <RootRow>
                <td>0</td>
                <td>{bom.productCode}</td>
                <td className="name">
                  <FaCubes style={{ marginRight: 8, color: "#1a4f8b" }} />
                  {bom.productName}
                </td>
                <td>
                  <TypeLabel $type="FG">FG</TypeLabel>
                </td>
                <td>1</td>
                <td>ea</td>
              </RootRow>
              {/* Children Items */}
              {bomItems &&
                bomItems.map((child) => (
                  <BomTableRow key={child.id} bomItem={child} />
                ))}
            </tbody>
          </BomTable>
        </TableContainer>
      </>
    );
  },
);

const BomRevisionModal = React.memo(
  ({ bom, bomItems, materials, onClose, onAdd, onEdit, onDelete, onSave }) => {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalBox onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              <FaTools />
              Edit BOM
            </ModalTitle>
            <CloseBtn onClick={onClose}>
              <FaTimes />
            </CloseBtn>
          </ModalHeader>

          <ModalBody>
            <TableContainer>
              <BomTable>
                <thead>
                  <tr>
                    <th width="5%">Lv.</th>
                    <th width="20%">Material Code</th>
                    <th width="30%">Material Name</th>
                    <th width="5%">Type</th>
                    <th width="5%">Qty</th>
                    <th width="5%">Unit</th>
                    <th width="5%"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Root Item */}
                  <RootRow>
                    <td>0</td>
                    <td>{bom.productCode}</td>
                    <td className="name">
                      <FaCubes style={{ marginRight: 8, color: "#1a4f8b" }} />
                      {bom.productName}
                    </td>
                    <td>
                      <TypeLabel $type="FG">FG</TypeLabel>
                    </td>
                    <td>1</td>
                    <td colSpan={2}>ea</td>
                  </RootRow>
                  {/* Children Items */}
                  {bomItems &&
                    bomItems.map((child) => (
                      <BomTableRow
                        key={child.id}
                        bomItem={child}
                        isEdit={true}
                        onChange={(e) =>
                          onEdit(child.materialCode, e.target.value)
                        }
                        onDelete={() => onDelete(child.materialCode)}
                      />
                    ))}
                  <tr>
                    <td></td>
                    <td>
                      <MaterialSelect
                        onChange={(e) => {
                          onAdd(
                            materials.find(
                              (material) => material.code === e.target.value,
                            ),
                          );
                        }}
                      >
                        <option value="">-- 자재 선택 --</option>
                        {materials &&
                          (() => {
                            const bomCodes = new Set(
                              bomItems.map((item) => item.materialCode),
                            );
                            return materials
                              .filter(
                                (material) => !bomCodes.has(material.code),
                              )
                              .map((material) => (
                                <option key={material.id} value={material.code}>
                                  {material.code}
                                </option>
                              ));
                          })()}
                      </MaterialSelect>
                    </td>
                  </tr>
                </tbody>
              </BomTable>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <ModalBtn
              className="close"
              onClick={() => {
                onSave(bom, bomItems);
                onClose();
              }}
            >
              Save
            </ModalBtn>
          </ModalFooter>
        </ModalBox>
      </ModalOverlay>
    );
  },
);

/* =========================================================================
   Main Component
   ========================================================================= */

const BomPage = () => {
  const [bomList, setBomList] = useState([]);
  const [selectedBom, setSelectedBom] = useState(null);
  const [bomItems, setBomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [reqFetch, setReqFetch] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [bomItemsEdit, setBomItemsEdit] = useState([]);

  const [selectedProductCode, setSelectedProductCode] = useState(null);

  const openModal = () => {
    setBomItemsEdit(bomItems);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchBomList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/mes/master/bom/list");
      setBomList(res.data);
      setSelectedBom(res.data[0]);
      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBomItems = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedBom) {
        const bomId = selectedBom.id;
        const res = await axiosInstance.get(
          `/api/mes/master/bom-item/${bomId}`,
        );
        setBomItems(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [selectedBom]);

  useEffect(() => {
    fetchBomList();
  }, [fetchBomList]);

  useEffect(() => {
    if (!reqFetch) return;
    setReqFetch(false);

    const fetch = async () => {
      const res = await fetchBomList();
      if (res.data.length > 0) {
        if (selectedProductCode) {
          setSelectedBom(
            res.data.find((bom) => bom.productCode === selectedProductCode),
          );
          setSelectedProductCode(null);
        } else setSelectedBom(res.data[0]);
      }
    };

    fetch();
  }, [fetchBomList, reqFetch, selectedProductCode]);

  useEffect(() => {
    fetchBomItems();
  }, [fetchBomItems]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectBom = useCallback((bom) => {
    setSelectedBom(bom);
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        if (isModalOpen) {
          const res = await axiosInstance.get("/api/mes/master/material/list");
          setMaterials(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaterials();
  }, [isModalOpen]);

  const handleAdd = useCallback((material) => {
    if (!material || material.code === "") return;
    const bomItem = {
      materialCode: material.code,
      materialName: material.name,
      category: material.category,
      quantity: 0,
      unit: material.unit,
    };
    setBomItemsEdit((prev) => [...prev, bomItem]);
  }, []);

  const handleDelete = (code) => {
    setBomItemsEdit((prev) =>
      prev.filter((item) => item.materialCode !== code),
    );
  };

  const handleEdit = useCallback((code, qty) => {
    setBomItemsEdit((prev) =>
      prev.map((item) =>
        item.materialCode === code ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  const handleSave = useCallback(
    async (bom, bomItems) => {
      try {
        if (isModalOpen) {
          await axiosInstance.put(`/api/mes/master/bom/${bom.id}`, {
            bomItems,
          });
          setSelectedProductCode(bom.productCode);
          setReqFetch(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [isModalOpen],
  );

  // ★ PDF 생성 및 다운로드 함수
  // 주의: 기본 jspdf는 한글 폰트를 지원하지 않아 한글이 깨질 수 있습니다.
  // 한글 출력을 위해서는 별도의 폰트 파일(.ttf)을 base64로 변환하여 addFileToVFS로 추가해야 합니다.
  // 아래 코드는 기능 구현을 위한 기본 구조이며, 한글 깨짐 방지를 위해 영문 예시 헤더를 사용하거나 폰트 설정이 필요합니다.
  const handleExportPdf = useCallback(() => {
    if (!selectedBom) return;

    const doc = new jsPDF();

    // ★ 2. 한글 폰트 등록 (반드시 텍스트 출력 전에 해야 함)
    // (1) 가상 파일 시스템(VFS)에 폰트 파일 추가
    doc.addFileToVFS("NanumGothic.ttf", fontBase64);
    // (2) 폰트 추가 (파일명, 폰트명, 스타일)
    doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
    // (3) 문서 전체에 폰트 적용
    doc.setFont("NanumGothic");

    // 1. Title
    doc.setFontSize(18);
    doc.text("Bill of Materials (BOM)", 14, 20);

    // 2. Info Section
    doc.setFontSize(11);
    doc.setTextColor(100);

    // 한글이 포함될 수 있는 변수들
    doc.text(`Product Name: ${selectedBom.productName}`, 14, 30);
    doc.text(`Product Code: ${selectedBom.productCode}`, 14, 36);
    doc.text(`Revision: ${selectedBom.revision}`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 48);

    // 3. Table Data Preparation
    const tableColumn = [
      "Level",
      "Material Code",
      "Material Name",
      "Type",
      "Qty",
      "Unit",
    ];

    const tableRows = [];

    tableRows.push([
      "0",
      selectedBom.productCode,
      selectedBom.productName,
      "FG",
      "1",
      "ea",
    ]);

    bomItems.forEach((item) => {
      const rowData = [
        "1",
        item.materialCode,
        item.materialName,
        item.category,
        item.quantity,
        item.unit,
      ];
      tableRows.push(rowData);
    });

    // 4. Generate Table
    autoTable(doc, {
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [26, 79, 139] },

      // ★ 3. 테이블 내부에도 폰트 적용 필수!
      styles: {
        font: "NanumGothic", // 위에서 addFont한 이름과 동일해야 함
        fontStyle: "normal",
        fontSize: 9,
      },
    });

    // 5. Save File
    doc.save(`${selectedBom.productCode}_BOM_Rev${selectedBom.revision}.pdf`);
  }, [selectedBom, bomItems]);

  const filteredBoms = useMemo(() => {
    return bomList
      .filter(
        (bom) =>
          bom.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bom.productCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter(
        (bom) =>
          bom.productCode === selectedBom.productCode ||
          bom.status === "ACTIVE",
      );
  }, [bomList, searchTerm, selectedBom]);

  return (
    <Container>
      <SidebarPanel
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredBoms={filteredBoms}
        selectedBomId={selectedBom?.id}
        onSelect={handleSelectBom}
      />

      <ContentArea>
        <DetailView
          bom={selectedBom}
          bomItems={bomItems}
          onClickRevisionChange={openModal}
          // ★ DetailView에 함수 전달
          onExportPdf={handleExportPdf}
        />
      </ContentArea>
      {isModalOpen && (
        <BomRevisionModal
          bom={selectedBom}
          bomItems={bomItemsEdit}
          materials={materials}
          onClose={closeModal}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleSave}
        ></BomRevisionModal>
      )}
    </Container>
  );
};

export default BomPage;
