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
const EquipmentRow = React.memo(({ eq, onToggleStatus, onDelete }) => {
  return (
    <tr>
      <td>
        <StatusBadge
          $status={eq.status}
          onClick={() => onToggleStatus(eq.id, eq.status)}
          title="Click to Toggle Status"
        >
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
        <IconButton className="edit">
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

  // 1. 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      // const res = await axiosInstance.get("http://localhost:3001/equipments");
      // setEquipments(res.data);

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

  // 2. Handlers - useCallback
  const toggleStatus = useCallback(async (id, currentStatus) => {
    const newStatus = currentStatus === "RUN" ? "IDLE" : "RUN";
    try {
      // await axiosInstance.patch(`http://localhost:3001/equipments/${id}`, { status: newStatus });
      setEquipments((prev) =>
        prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq)),
      );
    } catch (err) {
      console.error("Update Error", err);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      // await axiosInstance.delete(`http://localhost:3001/equipments/${id}`);
      setEquipments((prev) => prev.filter((eq) => eq.id !== id));
    } catch (err) {
      console.error("Delete Error", err);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddClick = useCallback(() => {
    alert("Add Modal Open");
  }, []);

  // 3. Filtering - useMemo
  const filteredList = useMemo(() => {
    return equipments.filter(
      (eq) =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [equipments, searchTerm]);

  return (
    <Container>
      {/* 헤더 (Memoized) */}
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
                onToggleStatus={toggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>
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

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
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
  transition: transform 0.1s;
  &:active {
    transform: scale(0.95);
  }
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
