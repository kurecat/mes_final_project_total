// src/pages/mdm/BomPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaSearch,
  FaSitemap,
  FaCube,
  FaCubes,
  FaPlus,
  FaEdit,
  FaFileExport,
  FaFlask,
  FaMicrochip,
  FaSync,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_BOMS = [
  {
    id: "BOM-DDR5-MOD-16G",
    name: "DDR5 16GB UDIMM 5600MHz",
    revision: "Rev. B",
    status: "ACTIVE",
    type: "FG",
    lastUpdated: "2024-06-01",
    children: [
      {
        level: 1,
        id: "PCB-DDR5-U08",
        name: "DDR5 UDIMM PCB",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "8-Layer, OSP",
      },
      {
        level: 1,
        id: "IC-DDR5-16Gb",
        name: "DDR5 16Gb SDRAM",
        type: "ASSY",
        qty: 8,
        unit: "ea",
        spec: "x8 Component",
      },
      {
        level: 1,
        id: "IC-SPD-HUB",
        name: "SPD Hub + PMIC",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "Renesas",
      },
      {
        level: 1,
        id: "PASSIVE-R-0402",
        name: "Chip Resistor",
        type: "MAT",
        qty: 32,
        unit: "ea",
        spec: "100 ohm",
      },
      {
        level: 1,
        id: "PASSIVE-C-0402",
        name: "MLCC",
        type: "MAT",
        qty: 16,
        unit: "ea",
        spec: "10uF",
      },
    ],
  },
  {
    id: "BOM-DDR5-IC-16Gb",
    name: "DDR5 16Gb SDRAM Component",
    revision: "Rev. A",
    status: "ACTIVE",
    type: "ASSY",
    lastUpdated: "2024-05-20",
    children: [
      {
        level: 1,
        id: "WF-DDR5-PROC",
        name: "Processed D-RAM Wafer",
        type: "ASSY",
        qty: 1,
        unit: "ea",
        spec: "1znm Node",
      },
      {
        level: 1,
        id: "LF-BGA-78",
        name: "BGA Substrate",
        type: "PART",
        qty: 1,
        unit: "ea",
        spec: "78-Ball",
      },
      {
        level: 1,
        id: "MAT-EMC-G700",
        name: "Epoxy Molding Compound",
        type: "MAT",
        qty: 0.5,
        unit: "g",
        spec: "Low Warpage",
      },
      {
        level: 1,
        id: "MAT-WIRE-AU",
        name: "Bonding Wire",
        type: "MAT",
        qty: 25,
        unit: "mm",
        spec: "Au 99.99%",
      },
    ],
  },
  {
    id: "BOM-WF-DDR5-PROC",
    name: "Processed D-RAM Wafer (Fab)",
    revision: "Rev. C",
    status: "ACTIVE",
    type: "ASSY",
    lastUpdated: "2024-05-15",
    children: [
      {
        level: 1,
        id: "RM-WF-12-P",
        name: "12-inch Prime Wafer",
        type: "MAT",
        qty: 1,
        unit: "ea",
        spec: "Si (100) P-Type",
      },
      {
        level: 1,
        id: "CHM-PR-ARF",
        name: "Photo Resist (ArF)",
        type: "CHEM",
        qty: 15,
        unit: "ml",
        spec: "Immersion Grade",
      },
      {
        level: 1,
        id: "GAS-C4F6",
        name: "Etching Gas (C4F6)",
        type: "CHEM",
        qty: 500,
        unit: "sccm",
        spec: "99.999%",
      },
      {
        level: 1,
        id: "TGT-CU-01",
        name: "Copper Target",
        type: "MAT",
        qty: 0.01,
        unit: "ea",
        spec: "PVD Deposition",
      },
    ],
  },
];

const BomPage = () => {
  const [bomList, setBomList] = useState(MOCK_BOMS);
  const [selectedBom, setSelectedBom] = useState(null); // 초기엔 null
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API: http://localhost:3001/boms
      // const res = await axios.get("http://localhost:3001/boms");
      // setBomList(res.data);
      // if (res.data.length > 0) setSelectedBom(res.data[0]);

      setTimeout(() => {
        setBomList(MOCK_BOMS);
        setSelectedBom(MOCK_BOMS[0]); // 데이터 로드 후 첫 번째 선택
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBoms = bomList.filter(
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
              $active={selectedBom && selectedBom.id === bom.id}
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
        {selectedBom ? (
          <>
            <DetailHeader>
              <HeaderLeft>
                <ProductName>
                  {selectedBom.name} <RevBadge>{selectedBom.revision}</RevBadge>
                </ProductName>
                <ProductMeta>
                  Code: <strong>{selectedBom.id}</strong> | Type:{" "}
                  {selectedBom.type} | Last Updated: {selectedBom.lastUpdated}
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
                    <td>Finished Product</td>
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
                        <Indent $level={child.level}>
                          <LCorner />
                          {/* 자재 타입별 아이콘 분기 */}
                          {child.type === "CHEM" ? (
                            <FaFlask
                              color="#e74c3c"
                              size={12}
                              style={{ marginRight: 5 }}
                            />
                          ) : child.type === "ASSY" ? (
                            <FaMicrochip
                              color="#f39c12"
                              size={12}
                              style={{ marginRight: 5 }}
                            />
                          ) : (
                            <FaCube
                              color="#3498db"
                              size={12}
                              style={{ marginRight: 5 }}
                            />
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
          </>
        ) : (
          <EmptyState>Select a BOM to view details</EmptyState>
        )}
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
