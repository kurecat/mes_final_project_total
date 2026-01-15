// src/pages/production/ProductionPlanPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckDouble,
  FaSync,
  FaArrowRight,
  FaIndustry,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_PLANS = [
  {
    id: "PP-240601-01",
    date: "2024-06-01",
    product: "DDR5 1znm Wafer",
    line: "Fab-Line-A",
    type: "FAB",
    planQty: 1000,
    status: "COMPLETED",
  },
  {
    id: "PP-240602-02",
    date: "2024-06-02",
    product: "16Gb DDR5 SDRAM",
    line: "EDS-Line-01",
    type: "EDS",
    planQty: 50000,
    status: "RELEASED",
  },
  {
    id: "PP-240605-03",
    date: "2024-06-05",
    product: "DDR5 32GB UDIMM",
    line: "Mod-Line-C",
    type: "MOD",
    planQty: 2000,
    status: "PLANNED",
  },
  {
    id: "PP-240606-04",
    date: "2024-06-06",
    product: "LPDDR5X Mobile",
    line: "Fab-Line-B",
    type: "FAB",
    planQty: 800,
    status: "PLANNED",
  },
];

const ProductionPlanPage = () => {
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [filterLine, setFilterLine] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 데이터 조회 (READ)
  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API: http://localhost:3001/productionPlans
      // const res = await axios.get("http://localhost:3001/productionPlans");
      // setPlans(res.data);

      setTimeout(() => {
        setPlans(MOCK_PLANS);
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

  // 2. 계획 확정 (UPDATE Status)
  // PLANNED -> RELEASED (Work Order 생성 단계로 넘어감)
  const handleRelease = async (id) => {
    try {
      // await axios.patch(`http://localhost:3001/productionPlans/${id}`, { status: "RELEASED" });
      // fetchData();

      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "RELEASED" } : p))
      );
      alert(`Plan [${id}] has been released to production.`);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. 계획 삭제 (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까? (확정된 계획은 삭제 주의)")) return;
    try {
      // await axios.delete(`http://localhost:3001/productionPlans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 4. 새 계획 추가 (CREATE - Mock)
  const handleAdd = () => {
    const newPlan = {
      id: `PP-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split("T")[0],
      product: "New Product Plan",
      line: "Fab-Line-A",
      type: "FAB",
      planQty: 500,
      status: "PLANNED",
    };
    setPlans([newPlan, ...plans]);
  };

  // 필터링
  const filteredPlans = plans.filter((p) => {
    const matchLine = filterLine === "ALL" || p.type === filterLine;
    const matchSearch =
      p.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLine && matchSearch;
  });

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaCalendarAlt /> Production Planning
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Fab / EDS / Module Daily Output Plan</SubTitle>
        </TitleArea>
        <ActionGroup>
          <AddButton onClick={handleAdd}>
            <FaPlus /> Create Plan
          </AddButton>
        </ActionGroup>
      </Header>

      {/* 컨트롤 바 */}
      <ControlBar>
        <FilterGroup>
          <FilterBtn
            $active={filterLine === "ALL"}
            onClick={() => setFilterLine("ALL")}
          >
            All Lines
          </FilterBtn>
          <FilterBtn
            $active={filterLine === "FAB"}
            onClick={() => setFilterLine("FAB")}
          >
            Fab (Wafer)
          </FilterBtn>
          <FilterBtn
            $active={filterLine === "EDS"}
            onClick={() => setFilterLine("EDS")}
          >
            EDS (Chip)
          </FilterBtn>
          <FilterBtn
            $active={filterLine === "MOD"}
            onClick={() => setFilterLine("MOD")}
          >
            Module
          </FilterBtn>
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Product or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </ControlBar>

      {/* 테이블 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Plan ID</th>
              <th>Date</th>
              <th>Target Line</th>
              <th>Product Item</th>
              <th>Plan Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan) => (
              <tr key={plan.id}>
                <td>
                  <StatusBadge $status={plan.status}>{plan.status}</StatusBadge>
                </td>
                <td style={{ fontWeight: "bold", color: "#1a4f8b" }}>
                  {plan.id}
                </td>
                <td>{plan.date}</td>
                <td style={{ fontSize: 13 }}>
                  <LineTag $type={plan.type}>{plan.line}</LineTag>
                </td>
                <td style={{ fontWeight: "600" }}>{plan.product}</td>
                <td>
                  {plan.planQty.toLocaleString()}
                  <Unit>
                    {plan.type === "FAB"
                      ? "wfrs"
                      : plan.type === "EDS"
                      ? "chips"
                      : "ea"}
                  </Unit>
                </td>
                <td>
                  <ActionButtons>
                    {plan.status === "PLANNED" && (
                      <IconBtn
                        className="confirm"
                        onClick={() => handleRelease(plan.id)}
                        title="Release Plan"
                      >
                        <FaCheckDouble /> Release
                      </IconBtn>
                    )}
                    <IconBtn className="edit">
                      <FaEdit />
                    </IconBtn>
                    <IconBtn
                      className="del"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <FaTrash />
                    </IconBtn>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductionPlanPage;

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
  margin-left: 32px;
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
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "COMPLETED"
      ? "#e8f5e9"
      : props.$status === "RELEASED"
      ? "#e3f2fd"
      : "#fff3e0"};
  color: ${(props) =>
    props.$status === "COMPLETED"
      ? "#2e7d32"
      : props.$status === "RELEASED"
      ? "#1976d2"
      : "#e67e22"};
`;

const LineTag = styled.span`
  background: #f5f5f5;
  color: #666;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid #eee;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  &::before {
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) =>
      props.$type === "FAB"
        ? "#9b59b6"
        : props.$type === "EDS"
        ? "#e67e22"
        : "#3498db"};
  }
`;

const Unit = styled.span`
  font-size: 11px;
  color: #999;
  margin-left: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;
const IconBtn = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
  }
  &.confirm {
    color: #2ecc71;
    border-color: #2ecc71;
    &:hover {
      background: #e8f5e9;
    }
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
