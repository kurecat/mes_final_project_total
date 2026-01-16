import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckDouble,
  FaSync,
  FaTimes,
} from "react-icons/fa";

const ProductionPlanPage = () => {
  // 1. 초기화: 로컬 스토리지 데이터만 사용 (없으면 빈 배열)
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem("productionPlans");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [filterLine, setFilterLine] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // 상태가 변할 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("productionPlans", JSON.stringify(plans));
  }, [plans]);

  // 데이터 로딩 효과 (0.3초)
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 2. 계획 확정 (RELEASE)
  const handleRelease = (id) => {
    const targetPlan = plans.find((p) => p.id === id);
    if (!targetPlan) return;

    if (
      !window.confirm(
        `[${targetPlan.id}] 계획을 확정하고 작업지시를 발행하시겠습니까?`
      )
    )
      return;

    // 계획 상태 변경
    const updatedPlans = plans.map((p) =>
      p.id === id ? { ...p, status: "RELEASED" } : p
    );
    setPlans(updatedPlans);

    // 작업 지시(Work Order) 생성 후 로컬 스토리지 저장
    const newWorkOrder = {
      id: `WO-${targetPlan.id.split("-")[1]}-${Math.floor(
        Math.random() * 100
      )}`,
      product: targetPlan.product,
      line: targetPlan.line,
      type: targetPlan.type,
      status: "READY",
      planQty: targetPlan.planQty,
      actualQty: 0,
      unit:
        targetPlan.type === "FAB"
          ? "wfrs"
          : targetPlan.type === "EDS"
          ? "chips"
          : "ea",
      progress: 0,
      priority: "NORMAL",
      startTime: "-",
      endTime: "-",
    };

    const existingOrders = JSON.parse(localStorage.getItem("workOrders")) || [];
    localStorage.setItem(
      "workOrders",
      JSON.stringify([newWorkOrder, ...existingOrders])
    );

    alert("작업지시가 발행되었습니다.");
  };

  // 3. 계획 삭제
  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // 4. 새 계획 추가
  const handleAdd = () => {
    const newPlan = {
      id: `PP-${new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split("T")[0],
      product: "New Product",
      line: "Fab-Line-A",
      type: "FAB",
      planQty: 1000,
      status: "PLANNED",
    };
    setPlans([newPlan, ...plans]);
  };

  // 5. 수정 버튼 클릭 핸들러
  const handleEditClick = (plan) => {
    setEditTarget({ ...plan }); // 깊은 복사
    setIsModalOpen(true);
  };

  // 6. 수정 사항 저장 핸들러
  const handleSaveEdit = () => {
    setPlans((prev) =>
      prev.map((p) => (p.id === editTarget.id ? editTarget : p))
    );
    setIsModalOpen(false);
    setEditTarget(null);
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

      <ControlBar>
        <FilterGroup>
          {["ALL", "FAB", "EDS", "MOD"].map((type) => (
            <FilterBtn
              key={type}
              $active={filterLine === type}
              onClick={() => setFilterLine(type)}
            >
              {type === "ALL" ? "All Lines" : type}
            </FilterBtn>
          ))}
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
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <StatusBadge $status={plan.status}>
                      {plan.status}
                    </StatusBadge>
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
                    {Number(plan.planQty).toLocaleString()}
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
                      <IconBtn
                        className="edit"
                        onClick={() => handleEditClick(plan)}
                      >
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#aaa",
                  }}
                >
                  No plans found. Create a new plan.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* --- Edit Modal --- */}
      {isModalOpen && editTarget && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Edit Production Plan</h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <label>Plan ID (Read Only)</label>
                <input value={editTarget.id} disabled />
              </FormGroup>
              <FormGroup>
                <label>Target Date</label>
                <input
                  type="date"
                  value={editTarget.date}
                  onChange={(e) =>
                    setEditTarget({ ...editTarget, date: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup>
                <label>Product Name</label>
                <input
                  value={editTarget.product}
                  onChange={(e) =>
                    setEditTarget({ ...editTarget, product: e.target.value })
                  }
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label>Process Type</label>
                  <select
                    value={editTarget.type}
                    onChange={(e) =>
                      setEditTarget({ ...editTarget, type: e.target.value })
                    }
                  >
                    <option value="FAB">FAB</option>
                    <option value="EDS">EDS</option>
                    <option value="MOD">MOD</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Line Name</label>
                  <input
                    value={editTarget.line}
                    onChange={(e) =>
                      setEditTarget({ ...editTarget, line: e.target.value })
                    }
                  />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label>Plan Quantity</label>
                <input
                  type="number"
                  value={editTarget.planQty}
                  onChange={(e) =>
                    setEditTarget({ ...editTarget, planQty: e.target.value })
                  }
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setIsModalOpen(false)}>
                Cancel
              </CancelButton>
              <SaveButton onClick={handleSaveEdit}>Save Changes</SaveButton>
            </ModalFooter>
          </ModalContent>
        </Overlay>
      )}
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
  margin-top: 20px;
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
  margin-top: 20px;
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

const ModalContent = styled.div`
  background: white;
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
    font-size: 18px;
    color: #333;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  flex: 1;
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #555;
  }
  input,
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #1a4f8b;
    }
    &:disabled {
      background-color: #f5f5f5;
      color: #999;
    }
  }
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  &:hover {
    background: #eee;
  }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #1a4f8b;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  &:hover {
    background: #133b6b;
  }
`;
