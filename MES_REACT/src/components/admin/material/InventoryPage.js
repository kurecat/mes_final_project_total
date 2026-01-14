// src/pages/resource/InventoryPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaPlus,
  FaFilter,
  FaBoxOpen,
  FaExclamationTriangle,
  FaArrowDown,
  FaHistory,
} from "react-icons/fa";

// --- Mock Data (HBM 반도체 자재) ---
const INVENTORY_DATA = [
  {
    id: "RM-WF-001",
    name: "12-inch Si Wafer (TSV)",
    category: "Raw Material",
    location: "WH-A-01",
    qty: 450,
    safetyStock: 100,
    maxStock: 1000,
    unit: "ea",
    lastUpdated: "2024-05-20 09:00",
  },
  {
    id: "CH-UF-023",
    name: "NCP Underfill Epoxy",
    category: "Chemical",
    location: "WH-C-05",
    qty: 15,
    safetyStock: 20, // 안전재고 미달 (Low)
    maxStock: 100,
    unit: "btl",
    lastUpdated: "2024-05-19 14:30",
  },
  {
    id: "PK-TR-102",
    name: "HBM Tray (JEDEC)",
    category: "Packaging",
    location: "WH-B-12",
    qty: 2100,
    safetyStock: 500,
    maxStock: 3000,
    unit: "ea",
    lastUpdated: "2024-05-20 11:15",
  },
  {
    id: "RM-BM-005",
    name: "Micro Bump (SnAg)",
    category: "Raw Material",
    location: "WH-A-04",
    qty: 85000,
    safetyStock: 10000,
    maxStock: 100000,
    unit: "ea",
    lastUpdated: "2024-05-18 16:20",
  },
  {
    id: "SP-FX-009",
    name: "Soldering Flux",
    category: "Chemical",
    location: "WH-C-02",
    qty: 25,
    safetyStock: 20, // 주의 (Warning)
    maxStock: 50,
    unit: "btl",
    lastUpdated: "2024-05-20 10:00",
  },
  {
    id: "WP-ST-301",
    name: "8-Hi Stacked Die (WIP)",
    category: "WIP",
    location: "LN-03-BF",
    qty: 120,
    safetyStock: 50,
    maxStock: 500,
    unit: "ea",
    lastUpdated: "2024-05-20 13:45",
  },
];

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // 필터링 로직
  const filteredData = INVENTORY_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 상태 계산 함수 (재고 수준에 따른 색상)
  const getStatus = (qty, safety) => {
    if (qty <= safety) return { label: "Low", color: "#e74c3c", bg: "#fadbd8" }; // 빨강
    if (qty <= safety * 1.2)
      return { label: "Warning", color: "#f39c12", bg: "#fdebd0" }; // 주황
    return { label: "Normal", color: "#27ae60", bg: "#d5f5e3" }; // 초록
  };

  return (
    <Container>
      {/* 1. 상단 요약 카드 (Summary Stats) */}
      <StatsRow>
        <StatCard>
          <IconWrapper $color="#3498db">
            <FaBoxOpen />
          </IconWrapper>
          <StatInfo>
            <StatLabel>총 품목 수</StatLabel>
            <StatValue>{INVENTORY_DATA.length}</StatValue>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconWrapper $color="#e74c3c">
            <FaExclamationTriangle />
          </IconWrapper>
          <StatInfo>
            <StatLabel>재고 부족 (Low)</StatLabel>
            <StatValue>1</StatValue> {/* 동적으로 계산 가능 */}
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconWrapper $color="#2ecc71">
            <FaArrowDown />
          </IconWrapper>
          <StatInfo>
            <StatLabel>금일 입고 건수</StatLabel>
            <StatValue>12</StatValue>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconWrapper $color="#9b59b6">
            <FaHistory />
          </IconWrapper>
          <StatInfo>
            <StatLabel>자재 회전율</StatLabel>
            <StatValue>94%</StatValue>
          </StatInfo>
        </StatCard>
      </StatsRow>

      {/* 2. 컨트롤 바 (검색 & 필터 & 버튼) */}
      <ControlBar>
        <LeftControls>
          <SearchBox>
            <FaSearch color="#999" />
            <SearchInput
              placeholder="품목명 또는 코드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <SelectBox
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">전체 카테고리</option>
            <option value="Raw Material">원자재 (Raw)</option>
            <option value="Chemical">화학 (Chemical)</option>
            <option value="Packaging">포장재 (Packaging)</option>
            <option value="WIP">재공품 (WIP)</option>
          </SelectBox>
        </LeftControls>
        <RightControls>
          <AddButton>
            <FaPlus /> 자재 등록
          </AddButton>
        </RightControls>
      </ControlBar>

      {/* 3. 재고 목록 테이블 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="10%">Item Code</th>
              <th width="20%">Item Name</th>
              <th width="10%">Category</th>
              <th width="10%">Location</th>
              <th width="25%">Stock Level (Current / Max)</th>
              <th width="10%">Qty</th>
              <th width="10%">Status</th>
              <th width="5%">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const status = getStatus(item.qty, item.safetyStock);
              const percent = Math.min((item.qty / item.maxStock) * 100, 100);

              return (
                <tr key={item.id}>
                  <td className="code">{item.id}</td>
                  <td className="name">{item.name}</td>
                  <td>
                    <CategoryBadge $type={item.category}>
                      {item.category}
                    </CategoryBadge>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    {/* 재고 시각화 바 */}
                    <StockBarWrapper>
                      <StockBarBg>
                        <StockBarFill
                          $percent={percent}
                          $color={status.color}
                        />
                      </StockBarBg>
                      <StockText>{percent.toFixed(0)}%</StockText>
                    </StockBarWrapper>
                  </td>
                  <td>
                    <strong>{item.qty.toLocaleString()}</strong>{" "}
                    <small>{item.unit}</small>
                  </td>
                  <td>
                    <StatusBadge $color={status.color} $bg={status.bg}>
                      {status.label}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButton>More</ActionButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default InventoryPage;

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

// 1. Stats Section
const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  height: 100px;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  gap: 20px;
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

// 2. Control Bar
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  flex-shrink: 0;
`;

const LeftControls = styled.div`
  display: flex;
  gap: 15px;
`;

const RightControls = styled.div``;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 15px;
  width: 300px;
  height: 40px;

  &:focus-within {
    border-color: #1a4f8b;
  }
`;

const SearchInput = styled.input`
  border: none;
  margin-left: 10px;
  outline: none;
  font-size: 14px;
  width: 100%;
`;

const SelectBox = styled.select`
  height: 40px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  background: white;
  font-size: 14px;
  color: #555;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const AddButton = styled.button`
  background-color: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;

  &:hover {
    background-color: #133b6b;
  }
`;

// 3. Table
const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* 모서리 둥글게 */
  display: flex;
  flex-direction: column;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background-color: #f8f9fa;
    tr {
      height: 50px;
      border-bottom: 2px solid #eee;
    }
    th {
      text-align: left;
      padding: 0 20px;
      color: #555;
      font-weight: 600;
    }
  }

  tbody {
    tr {
      height: 60px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f9fbff;
      }
    }
    td {
      padding: 0 20px;
      color: #333;
      vertical-align: middle;

      &.code {
        font-family: monospace;
        color: #666;
      }
      &.name {
        font-weight: 600;
      }
    }
  }
`;

// 배지 및 시각화 컴포넌트
const CategoryBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${(props) =>
    props.$type === "Raw Material"
      ? "#e3f2fd"
      : props.$type === "Chemical"
      ? "#f3e5f5"
      : "#fff3e0"};
  color: ${(props) =>
    props.$type === "Raw Material"
      ? "#1976d2"
      : props.$type === "Chemical"
      ? "#7b1fa2"
      : "#e65100"};
`;

const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
`;

const StockBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StockBarBg = styled.div`
  width: 100%;
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const StockBarFill = styled.div`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background-color: ${(props) => props.$color};
  border-radius: 4px;
`;

const StockText = styled.span`
  font-size: 12px;
  color: #888;
  width: 35px; /* 고정 너비 */
  text-align: right;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: #666;
  font-size: 12px;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;
