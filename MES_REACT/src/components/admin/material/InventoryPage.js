// src/pages/resource/InventoryPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axios from "axios";
import {
  FaBoxOpen,
  FaSearch,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaHistory,
  FaPlus,
  FaMinus,
  FaFlask,
  FaMicrochip,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_INVENTORY = [
  {
    id: "RM-WF-12",
    name: "12-inch Prime Wafer",
    type: "RAW",
    loc: "WH-A-01",
    qty: 1200,
    safety: 500,
    unit: "ea",
    status: "NORMAL",
    condition: "23°C / 45%",
  },
  {
    id: "CHM-PR-ARF",
    name: "Photo Resist (ArF)",
    type: "CHEM",
    loc: "WH-Cold-02",
    qty: 45,
    safety: 50,
    unit: "Btl",
    status: "LOW",
    condition: "4°C (Cold)",
  },
  {
    id: "GAS-C4F6",
    name: "Etching Gas (C4F6)",
    type: "GAS",
    loc: "Gas-Bunker",
    qty: 800,
    safety: 200,
    unit: "kg",
    status: "NORMAL",
    condition: "High Press",
  },
  {
    id: "TGT-CU-01",
    name: "Copper Target (Cu)",
    type: "PART",
    loc: "WH-B-05",
    qty: 8,
    safety: 10,
    unit: "ea",
    status: "LOW",
    condition: "Vacuum",
  },
  {
    id: "MAT-EMC-G",
    name: "Epoxy Molding Comp.",
    type: "PKG",
    loc: "WH-C-12",
    qty: 500,
    safety: 300,
    unit: "kg",
    status: "NORMAL",
    condition: "Dry Box",
  },
];

// --- [Optimized] Sub-Components with React.memo ---

// 1. Stats Section
const InventoryStats = React.memo(
  ({ totalItems, lowStockItems, totalValue }) => {
    return (
      <StatsGrid>
        <StatCard>
          <IconBox $color="#1a4f8b">
            <FaBoxOpen />
          </IconBox>
          <StatInfo>
            <Label>Total SKU</Label>
            <Value>{totalItems}</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#e74c3c">
            <FaExclamationTriangle />
          </IconBox>
          <StatInfo>
            <Label>Low Stock Alert</Label>
            <Value style={{ color: "#e74c3c" }}>
              {lowStockItems} <small>items</small>
            </Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#2ecc71">
            <FaThermometerHalf />
          </IconBox>
          <StatInfo>
            <Label>Storage Status</Label>
            <Value style={{ fontSize: 18 }}>All Good</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#f39c12">
            <FaMicrochip />
          </IconBox>
          <StatInfo>
            <Label>Total Asset Value</Label>
            <Value>
              ₩ {totalValue} <small>B</small>
            </Value>
          </StatInfo>
        </StatCard>
      </StatsGrid>
    );
  },
);

// 2. Table Row Component
const InventoryRow = React.memo(({ item }) => {
  const percent = Math.min((item.qty / (item.safety * 2)) * 100, 100);
  const isLow = item.qty <= item.safety;

  return (
    <tr>
      <td style={{ fontFamily: "monospace", color: "#555" }}>{item.id}</td>
      <td
        style={{
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {item.type === "CHEM" ? (
          <FaFlask color="#e67e22" />
        ) : (
          <FaBoxOpen color="#1a4f8b" />
        )}
        {item.name}
      </td>
      <td>
        <TypeBadge $type={item.type}>{item.type}</TypeBadge>
      </td>
      <td>{item.loc}</td>
      <td style={{ fontSize: 12, color: "#666" }}>{item.condition}</td>
      <td>
        <ProgressWrapper>
          <ProgressBar>
            <ProgressFill $width={percent} $isLow={isLow} />
          </ProgressBar>
          <ProgressLabel>
            {item.qty} / {item.safety}
          </ProgressLabel>
        </ProgressWrapper>
      </td>
      <td style={{ fontWeight: "bold" }}>
        {item.qty} <small>{item.unit}</small>
      </td>
      <td>
        {isLow ? (
          <StatusBadge $status="LOW">Refill Req</StatusBadge>
        ) : (
          <StatusBadge $status="NORMAL">Normal</StatusBadge>
        )}
      </td>
      <td>
        <TableActionBtn>
          <FaMinus /> Issue
        </TableActionBtn>
      </td>
    </tr>
  );
});

const InventoryPage = () => {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // [Optimization] fetchData with useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // const res = await axios.get("http://localhost:3001/inventory");
      // setInventory(res.data);

      setTimeout(() => {
        setInventory(MOCK_INVENTORY);
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

  // [Optimization] Memoize filteredData
  // This computation is skipped if inventory, filterType, and searchTerm haven't changed
  const filteredData = useMemo(() => {
    return inventory.filter((item) => {
      const matchType = filterType === "ALL" || item.type === filterType;
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [inventory, filterType, searchTerm]);

  // [Optimization] Memoize KPI calculations
  const kpiStats = useMemo(() => {
    return {
      totalItems: inventory.length,
      lowStockItems: inventory.filter((i) => i.qty <= i.safety).length,
      totalValue: 15.4, // Fixed value for now
    };
  }, [inventory]);

  return (
    <Container>
      {/* 1. Header */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaBoxOpen /> Material Inventory
          </PageTitle>
          <SubTitle>Warehouse Real-time Stock Monitoring</SubTitle>
        </TitleArea>
        <HeaderActions>
          <ActionButton>
            <FaHistory /> Transaction Log
          </ActionButton>
          <ActionButton $primary>
            <FaPlus /> Stock In
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* 2. KPI Summary (Memoized Component) */}
      <InventoryStats
        totalItems={kpiStats.totalItems}
        lowStockItems={kpiStats.lowStockItems}
        totalValue={kpiStats.totalValue}
      />

      {/* 3. List & Controls */}
      <ContentSection>
        <ControlBar>
          <FilterGroup>
            {["ALL", "RAW", "CHEM", "GAS", "PKG"].map((type) => (
              <FilterBtn
                key={type}
                $active={filterType === type}
                onClick={() => setFilterType(type)}
              >
                {type === "ALL"
                  ? "All"
                  : type === "RAW"
                    ? "Raw Wafer"
                    : type === "CHEM"
                      ? "Chemical"
                      : type === "GAS"
                        ? "Gas"
                        : "Packaging"}
              </FilterBtn>
            ))}
          </FilterGroup>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </ControlBar>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th width="15%">Material ID</th>
                <th>Material Name</th>
                <th width="10%">Type</th>
                <th width="12%">Location</th>
                <th width="10%">Condition</th>
                <th width="20%">Stock Level (Curr / Safety)</th>
                <th width="10%">Qty</th>
                <th width="10%">Status</th>
                <th width="8%">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ContentSection>
    </Container>
  );
};

export default InventoryPage;

// --- Styled Components (No changes needed, keeping same styles) ---
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
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;
const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  &:hover {
    opacity: 0.9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;
const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
`;
const IconBox = styled.div`
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
const Label = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;
const Value = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #333;
  small {
    font-size: 14px;
    color: #888;
    margin-left: 5px;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const FilterBtn = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$active ? "#1a4f8b" : "#eee")};
  background: ${(props) => (props.$active ? "#1a4f8b" : "#f9f9f9")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  &:hover {
    background: ${(props) => (props.$active ? "#133b6b" : "#eee")};
  }
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    width: 200px;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th {
    text-align: left;
    padding: 12px;
    background: #f9f9f9;
    color: #666;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
    vertical-align: middle;
  }
`;
const TypeBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "CHEM"
      ? "#ffebee"
      : props.$type === "GAS"
        ? "#e3f2fd"
        : props.$type === "RAW"
          ? "#e8f5e9"
          : "#f3e5f5"};
  color: ${(props) =>
    props.$type === "CHEM"
      ? "#c62828"
      : props.$type === "GAS"
        ? "#1565c0"
        : props.$type === "RAW"
          ? "#2e7d32"
          : "#7b1fa2"};
`;
const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;
const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background-color: ${(props) => (props.$isLow ? "#e74c3c" : "#2ecc71")};
  transition: width 0.3s;
`;
const ProgressLabel = styled.span`
  font-size: 11px;
  color: #666;
  width: 80px;
  text-align: right;
`;
const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${(props) => (props.$status === "LOW" ? "#e74c3c" : "#2ecc71")};
  background: ${(props) => (props.$status === "LOW" ? "#ffebee" : "#e8f5e9")};
  padding: 3px 6px;
  border-radius: 4px;
`;
const TableActionBtn = styled.button`
  border: 1px solid #ddd;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
  }
`;
