// src/pages/mdm/BomPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaSitemap,
  FaCube,
  FaCubes,
  FaPlus,
  FaEdit,
  FaFileExport,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";

// --- Mock Data (HBM BOM 구조) ---
// 실제로는 API에서 재귀적(Recursive) 구조로 받아옵니다.
const BOM_LIST = [
  {
    id: "BOM-HBM3-8HI",
    name: "HBM3 8-Hi Stack Module",
    revision: "Rev. C",
    status: "ACTIVE",
    type: "FG", // Finished Good
    lastUpdated: "2024-05-15",
    children: [
      {
        level: 1,
        id: "SA-CORE-001",
        name: "8-Hi Core Die Stack",
        type: "ASSY",
        qty: 1,
        unit: "ea",
        spec: "Stacking",
      },
      {
        level: 2,
        id: "CP-DRAM-102",
        name: "16Gb DRAM Die (KGSD)",
        type: "PART",
        qty: 8,
        unit: "ea",
        spec: "10nm Class",
      },
      {
        level: 2,
        id: "MT-NCF-055",
        name: "Non-Conductive Film",
        type: "MAT",
        qty: 0.5,
        unit: "roll",
        spec: "T-20um",
      },
      {
        level: 1,
        id: "CP-LOGIC-009",
        name: "Base Logic Die",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "Controller",
      },
      {
        level: 1,
        id: "MT-UF-900",
        name: "Molded Underfill",
        type: "MAT",
        qty: 2.5,
        unit: "g",
        spec: "MUF-Series",
      },
      {
        level: 1,
        id: "SA-SUB-200",
        name: "Package Substrate",
        type: "ASSY",
        qty: 1,
        unit: "ea",
        spec: "BGA Type",
      },
      {
        level: 2,
        id: "MT-BUMP-001",
        name: "Micro Bump (SnAg)",
        type: "MAT",
        qty: 4500,
        unit: "ea",
        spec: "20um Pitch",
      },
    ],
  },
  {
    id: "BOM-DDR5-MOD",
    name: "DDR5 32GB UDIMM",
    revision: "Rev. A",
    status: "DRAFT",
    type: "FG",
    lastUpdated: "2024-05-20",
    children: [
      {
        level: 1,
        id: "CP-PCB-004",
        name: "DDR5 PCB Board",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "8-Layer",
      },
      {
        level: 1,
        id: "CP-IC-505",
        name: "DDR5 SDRAM IC",
        type: "PART",
        qty: 16,
        unit: "ea",
        spec: "2G x 8",
      },
      {
        level: 1,
        id: "MT-SPD-001",
        name: "SPD Hub EEPROM",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "I3C",
      },
    ],
  },
];

const BomPage = () => {
  const [selectedBom, setSelectedBom] = useState(BOM_LIST[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // BOM 목록 필터링
  const filteredBoms = BOM_LIST.filter(
    (bom) =>
      bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      {/* 1. 좌측 사이드바: BOM Master List */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaSitemap /> Product BOMs
          </Title>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </SidebarHeader>

        <BomList>
          {filteredBoms.map((bom) => (
            <BomItem
              key={bom.id}
              $active={selectedBom.id === bom.id}
              onClick={() => setSelectedBom(bom)}
            >
              <ItemTop>
                <ItemName>{bom.name}</ItemName>
                <StatusBadge $status={bom.status}>{bom.status}</StatusBadge>
              </ItemTop>
              <ItemBottom>
                <span>{bom.id}</span>
                <span>{bom.revision}</span>
              </ItemBottom>
            </BomItem>
          ))}
        </BomList>

        <AddButton>
          <FaPlus /> New Product BOM
        </AddButton>
      </Sidebar>

      {/* 2. 우측 컨텐츠: BOM Detail Structure */}
      <ContentArea>
        <DetailHeader>
          <HeaderLeft>
            <ProductName>
              {selectedBom.name} <RevBadge>{selectedBom.revision}</RevBadge>
            </ProductName>
            <ProductMeta>
              Code: <strong>{selectedBom.id}</strong> | Type: {selectedBom.type}{" "}
              | Last Updated: {selectedBom.lastUpdated}
            </ProductMeta>
          </HeaderLeft>
          <HeaderRight>
            <ActionButton>
              <FaEdit /> Revision Change
            </ActionButton>
            <ActionButton $primary>
              <FaFileExport /> Export Excel
            </ActionButton>
          </HeaderRight>
        </DetailHeader>

        <TableContainer>
          <BomTable>
            <thead>
              <tr>
                <th width="5%">Lv.</th>
                <th width="15%">Part Number</th>
                <th width="25%">Item Name</th>
                <th width="10%">Type</th>
                <th width="10%">Qty</th>
                <th width="10%">Unit</th>
                <th width="25%">Specification</th>
              </tr>
            </thead>
            <tbody>
              {/* 루트(최상위) 아이템 표시 */}
              <RootRow>
                <td>0</td>
                <td>{selectedBom.id}</td>
                <td className="name">
                  <FaCubes style={{ marginRight: 8, color: "#1a4f8b" }} />
                  {selectedBom.name}
                </td>
                <td>
                  <TypeLabel $type="FG">FG</TypeLabel>
                </td>
                <td>1</td>
                <td>ea</td>
                <td>Finished Good</td>
              </RootRow>

              {/* 자식 아이템들 표시 */}
              {selectedBom.children.map((child, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center", color: "#888" }}>
                    {child.level}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#555" }}>
                    {child.id}
                  </td>
                  <td className="name">
                    {/* 레벨에 따른 들여쓰기 시각화 */}
                    <Indent $level={child.level}>
                      {child.level > 1 && <LCorner />}
                      {child.type === "ASSY" ? (
                        <FaCube color="#f39c12" /> // 반제품/Assy는 상자 아이콘
                      ) : (
                        <FaChevronRight size={10} color="#ccc" /> // 부품은 화살표
                      )}
                      <span>{child.name}</span>
                    </Indent>
                  </td>
                  <td>
                    <TypeLabel $type={child.type}>{child.type}</TypeLabel>
                  </td>
                  <td style={{ fontWeight: "600" }}>{child.qty}</td>
                  <td style={{ color: "#666" }}>{child.unit}</td>
                  <td style={{ color: "#666", fontSize: "13px" }}>
                    {child.spec}
                  </td>
                </tr>
              ))}
            </tbody>
          </BomTable>
        </TableContainer>
      </ContentArea>
    </Container>
  );
};

export default BomPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  display: flex;
  box-sizing: border-box;
`;

// Left Sidebar
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
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
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
  flex: 1;
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

const AddButton = styled.button`
  margin: 15px;
  padding: 12px;
  background-color: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #133b6b;
  }
`;

// Right Content
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 스크롤 사용 */
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

const ProductName = styled.div`
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

const ProductMeta = styled.div`
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
    background-color: ${(props) => (props.$primary ? "#133b6b" : "#f5f5f5")};
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
  background-color: #fffde7 !important; /* 최상위 로우 강조 */
  font-weight: bold;
`;

const Indent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  /* 레벨에 따라 좌측 여백 추가 */
  padding-left: ${(props) => (props.$level - 1) * 20}px;
`;

const LCorner = styled.div`
  width: 10px;
  height: 10px;
  border-left: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
  margin-right: 5px;
  margin-bottom: 5px; /* 위치 조정 */
`;

const TypeLabel = styled.span`
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 700;

  /* Type별 색상 구분 */
  background-color: ${(props) =>
    props.$type === "ASSY"
      ? "#fff3e0"
      : props.$type === "MAT"
      ? "#e3f2fd"
      : props.$type === "FG"
      ? "#e8f5e9"
      : "#f5f5f5"};

  color: ${(props) =>
    props.$type === "ASSY"
      ? "#e67e22"
      : props.$type === "MAT"
      ? "#1976d2"
      : props.$type === "FG"
      ? "#2e7d32"
      : "#666"};
`;
