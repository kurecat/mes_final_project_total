// src/pages/mdm/ItemPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axios from "axios";
import {
  FaBox,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSync,
  FaBarcode,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_ITEMS = [
  {
    id: "ITM-DDR5-16G",
    name: "DDR5 16GB UDIMM",
    type: "FERT",
    spec: "5600MHz, 1.1V",
    unit: "EA",
    safetyStock: 1000,
  },
  {
    id: "ITM-WF-PROC",
    name: "Processed D-RAM Wafer",
    type: "HALB",
    spec: "1znm Node, 12-inch",
    unit: "WF",
    safetyStock: 50,
  },
  {
    id: "ITM-CHIP-16Gb",
    name: "16Gb SDRAM Die",
    type: "HALB",
    spec: "x8, BGA Type",
    unit: "EA",
    safetyStock: 20000,
  },
  {
    id: "ITM-RAW-WF",
    name: "12-inch Prime Wafer",
    type: "ROH",
    spec: "Si (100) P-Type",
    unit: "BOX",
    safetyStock: 200,
  },
  {
    id: "ITM-PR-ARF",
    name: "Photo Resist (ArF)",
    type: "ROH",
    spec: "Immersion Grade",
    unit: "BTL",
    safetyStock: 20,
  },
];

// --- [Optimized] Sub-Components with React.memo ---

// 1. Control Bar Component
const ControlBarSection = React.memo(
  ({ filterType, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <ControlBar>
        <FilterGroup>
          {["ALL", "FERT", "HALB", "ROH"].map((type) => (
            <FilterBtn
              key={type}
              $active={filterType === type}
              onClick={() => onFilterChange(type)}
            >
              {type === "ALL"
                ? "All"
                : type === "FERT"
                  ? "Finished (FERT)"
                  : type === "HALB"
                    ? "Semi-Finish (HALB)"
                    : "Raw Material (ROH)"}
            </FilterBtn>
          ))}
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Code or Name..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
      </ControlBar>
    );
  },
);

// 2. Table Row Component
const ItemTableRow = React.memo(({ item, onDelete }) => {
  return (
    <tr>
      <td
        style={{
          fontFamily: "monospace",
          color: "#1a4f8b",
          fontWeight: "bold",
        }}
      >
        <FaBarcode style={{ marginRight: 5, color: "#999" }} />
        {item.id}
      </td>
      <td style={{ fontWeight: "600" }}>{item.name}</td>
      <td>
        <TypeBadge $type={item.type}>{item.type}</TypeBadge>
      </td>
      <td style={{ color: "#555" }}>{item.spec}</td>
      <td>
        <UnitBadge>{item.unit}</UnitBadge>
      </td>
      <td style={{ fontWeight: "bold" }}>
        {item.safetyStock.toLocaleString()}
      </td>
      <td className="center">
        <IconButton className="edit">
          <FaEdit />
        </IconButton>
        <IconButton className="del" onClick={() => onDelete(item.id)}>
          <FaTrash />
        </IconButton>
      </td>
    </tr>
  );
});

// --- Main Component ---

const ItemPage = () => {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      // const res = await axios.get("http://localhost:3001/items");
      // setItems(res.data);

      setTimeout(() => {
        setItems(MOCK_ITEMS);
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

  // 2. Handlers - useCallback
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`품목 코드 [${id}]를 삭제하시겠습니까?`)) return;
    try {
      // await axios.delete(`http://localhost:3001/items/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete Error", err);
    }
  }, []);

  const handleAdd = useCallback(() => {
    const newItem = {
      id: `ITM-NEW-${Math.floor(Math.random() * 1000)}`,
      name: "New Item Entry",
      type: "ROH",
      spec: "TBD",
      unit: "EA",
      safetyStock: 0,
    };
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // 3. Filtering - useMemo
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = filterType === "ALL" || item.type === filterType;
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [items, filterType, searchTerm]);

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaBox /> Item Master Information
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Standard Information for Product, Assy, Material</SubTitle>
        </TitleArea>
        <ActionGroup>
          <AddButton onClick={handleAdd}>
            <FaPlus /> New Item
          </AddButton>
        </ActionGroup>
      </Header>

      {/* 컨트롤 바 (Memoized) */}
      <ControlBarSection
        filterType={filterType}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* 테이블 영역 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="15%">Item Code</th>
              <th width="25%">Item Name</th>
              <th width="10%">Type</th>
              <th width="25%">Specification</th>
              <th width="8%">Unit</th>
              <th width="10%">Safety Stock</th>
              <th width="7%" className="center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <ItemTableRow key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </tbody>
        </Table>
      </TableContainer>
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
const AddButton = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

const TypeBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "FERT"
      ? "#e3f2fd"
      : props.$type === "HALB"
        ? "#fff3e0"
        : "#f3e5f5"};
  color: ${(props) =>
    props.$type === "FERT"
      ? "#1976d2"
      : props.$type === "HALB"
        ? "#e67e22"
        : "#7b1fa2"};
`;
const UnitBadge = styled.span`
  font-size: 11px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
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
