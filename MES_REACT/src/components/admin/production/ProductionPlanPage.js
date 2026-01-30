import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckDouble,
  FaSync,
  FaSave,
  FaTimes,
} from "react-icons/fa";

// =============================
// Dummy Fallback Data
// =============================
const MOCK_PLANS = [
  {
    id: "PP-240601-01",
    orderId: 1,
    date: "2024-06-01",
    productCode: "DRAM-4G-DDR4-001",
    productName: "DRAM 4Gb DDR4 칩",
    line: "Fab-Line-A",
    type: "FAB",
    planQty: 1000,
    status: "COMPLETED",
  },
  {
    id: "PP-240602-02",
    orderId: 2,
    date: "2024-06-02",
    productCode: "DRAM-16G-DDR5-003",
    productName: "DRAM 16Gb DDR5 칩",
    line: "EDS-Line-01",
    type: "EDS",
    planQty: 50000,
    status: "RELEASED",
  },
];

// =============================
// Sub Components
// =============================

// 1) Control Bar
const ControlBarSection = React.memo(
  ({ filterLine, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <ControlBar>
        <FilterGroup>
          {["ALL", "FAB", "EDS", "MOD"].map((line) => (
            <FilterBtn
              key={line}
              $active={filterLine === line}
              onClick={() => onFilterChange(line)}
            >
              {line === "ALL"
                ? "All Lines"
                : line === "FAB"
                  ? "Fab (Wafer)"
                  : line === "EDS"
                    ? "EDS (Chip)"
                    : "Module"}
            </FilterBtn>
          ))}
        </FilterGroup>

        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Product or ID..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
      </ControlBar>
    );
  },
);

// 2) Table Row
const PlanTableRow = React.memo(
  ({
    plan,
    isEditing,
    editForm,
    onEditStart,
    onEditCancel,
    onEditSave,
    onEditFormChange,
    onRelease,
    onDelete,
    products,
  }) => {
    return (
      <tr>
        <td>
          <StatusBadge $status={plan.status}>{plan.status}</StatusBadge>
        </td>

        <td style={{ fontWeight: "bold", color: "#1a4f8b" }}>{plan.id}</td>

        <td>{plan.date}</td>

        {/* Target Line */}
        <td style={{ fontSize: 13 }}>
          {isEditing ? (
            <EditInput
              value={editForm.targetLine}
              onChange={(e) => onEditFormChange("targetLine", e.target.value)}
            />
          ) : (
            plan.line
          )}
        </td>

        {/* Product (드롭다운으로 변경) */}
        <td style={{ fontWeight: "600" }}>
          {isEditing ? (
            <EditSelect
              value={editForm.productCode}
              onChange={(e) => onEditFormChange("productCode", e.target.value)}
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code})
                </option>
              ))}
            </EditSelect>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span>{plan.productName || "-"}</span>
              <span style={{ fontSize: 11, color: "#999" }}>
                {plan.productCode || "-"}
              </span>
            </div>
          )}
        </td>

        {/* Qty */}
        <td>
          {isEditing ? (
            <EditInput
              type="number"
              value={editForm.planQty}
              onChange={(e) => onEditFormChange("planQty", e.target.value)}
            />
          ) : (
            <>
              {Number(plan.planQty).toLocaleString()}
              <Unit>ea</Unit>
            </>
          )}
        </td>

        {/* Action */}
        <td>
          <ActionButtons>
            {/* Release */}
            {plan.status === "WAITING" && !isEditing && (
              <IconBtn
                className="confirm"
                onClick={() => onRelease(plan.id, plan.orderId)}
                title="Release Plan"
              >
                <FaCheckDouble /> Release
              </IconBtn>
            )}

            {/* Edit / Save / Cancel */}
            {!isEditing ? (
              <IconBtn
                className="edit"
                onClick={() => onEditStart(plan)}
                title="Edit"
              >
                <FaEdit />
              </IconBtn>
            ) : (
              <>
                <IconBtn
                  className="save"
                  onClick={() => onEditSave(plan.id, plan.orderId)}
                  title="Save"
                >
                  <FaSave /> Save
                </IconBtn>

                <IconBtn
                  className="cancel"
                  onClick={onEditCancel}
                  title="Cancel"
                >
                  <FaTimes /> Cancel
                </IconBtn>
              </>
            )}

            {/* Delete */}
            {!isEditing && (
              <IconBtn
                className="del"
                onClick={() => onDelete(plan.id, plan.orderId)}
                title="Delete"
              >
                <FaTrash />
              </IconBtn>
            )}
          </ActionButtons>
        </td>
      </tr>
    );
  },
);

// =============================
// Main Component
// =============================
const ProductionPlanPage = () => {
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [loading, setLoading] = useState(true);

  const [filterLine, setFilterLine] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 제품 목록 (code/name)
  const [products, setProducts] = useState([]);

  // 수정 상태
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editForm, setEditForm] = useState({
    productCode: "",
    planQty: "",
    targetLine: "",
  });

  // =============================
  // 1) 제품 목록 조회
  // =============================
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/mes/item`);
      const list = Array.isArray(res.data) ? res.data : [];
      // 기대 형태: [{ code: "...", name: "..." }, ...]
      setProducts(list);
    } catch (err) {
      console.error("제품 목록 조회 실패:", err);

      // fallback: DB 캡처 기준 임시 목록
      setProducts([
        { code: "DRAM-4G-DDR4-001", name: "DRAM 4Gb DDR4 칩" },
        { code: "DRAM-8G-DDR4-002", name: "DRAM 8Gb DDR4 칩" },
        { code: "DRAM-16G-DDR5-003", name: "DRAM 16Gb DDR5 칩" },
        { code: "DRAM-32G-DDR5-004", name: "DRAM 32Gb DDR5 칩" },
        { code: "DRAM-4G-LP-005", name: "Low-Power DRAM 4Gb" },
        { code: "DRAM-8G-MB-006", name: "Mobile DRAM 8Gb" },
        { code: "DRAM-16G-GR-007", name: "Graphics DRAM 16Gb" },
        { code: "DRAM-4G-EM-008", name: "Embedded DRAM 4Gb" },
      ]);
    }
  }, []);

  // =============================
  // WorkOrder -> Plan 변환
  // =============================
  const mapWorkOrderToPlan = useCallback(
    (wo) => {
      // wo.productId가 code라고 가정 (백엔드 설계상 code로 보내는 게 정상)
      const code = wo.productId || "";

      // code로 name 매핑 (products가 로드되어 있으면 name 표시 가능)
      const found = products.find((p) => p.code === code);
      const name = found?.name || "";

      return {
        id: wo.workorderNumber || `WO-${wo.id}`,
        orderId: wo.id,
        date: wo.startDate ? wo.startDate.split("T")[0] : "",
        productCode: code,
        productName: name,
        line: wo.targetLine || "Fab-Line-A",
        type: "FAB",
        planQty: wo.targetQty ?? 0,
        status: wo.status ?? "WAITING",
      };
    },
    [products],
  );

  // =============================
  // 2) 작업지시 조회
  // =============================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/mes/order`);
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map(mapWorkOrderToPlan);
      setPlans(mapped);
    } catch (err) {
      console.error("작업지시 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [mapWorkOrderToPlan]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // 제품 목록을 먼저 불러온 뒤, name 매핑이 가능해지므로 fetchData 실행
    fetchData();
  }, [fetchData]);

  // =============================
  // Handlers
  // =============================
  const handleAdd = useCallback(async () => {
    try {
      // 첫 번째 제품을 기본값으로 생성
      const defaultProductCode = products?.[0]?.code || "DRAM-4G-DDR4-001";

      const payload = {
        productId: defaultProductCode, // 서버는 code를 기대
        targetQty: 500,
        targetLine: "Fab-Line-A",
      };

      await axiosInstance.post(`/api/mes/order`, payload);
      alert("작업지시가 추가되었습니다.");
      fetchData();
    } catch (err) {
      console.error("작업지시 생성 실패:", err);
      alert("작업지시 추가 실패");
    }
  }, [fetchData, products]);

  const handleRelease = useCallback(
    async (planId, orderId) => {
      if (!orderId) {
        alert("orderId가 없습니다.");
        return;
      }
      try {
        await axiosInstance.post(`/api/mes/order/${orderId}/release`);
        alert(`Plan [${planId}] Release 완료`);
        fetchData();
      } catch (err) {
        console.error("Release 실패:", err);
        alert("Release 실패");
      }
    },
    [fetchData],
  );

  const handleDelete = useCallback(
    async (planId, orderId) => {
      if (!orderId) {
        alert("orderId가 없습니다.");
        return;
      }
      if (!window.confirm("삭제하시겠습니까?")) return;

      try {
        await axiosInstance.delete(`/api/mes/order/${orderId}`);
        alert("삭제 완료");
        fetchData();
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("삭제 실패");
      }
    },
    [fetchData],
  );

  const handleEditStart = useCallback((plan) => {
    setEditingPlanId(plan.id);
    setEditForm({
      productCode: plan.productCode ?? "",
      planQty: plan.planQty ?? "",
      targetLine: plan.line ?? "",
    });
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingPlanId(null);
    setEditForm({ productCode: "", planQty: "", targetLine: "" });
  }, []);

  const handleEditFormChange = useCallback((field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditSave = useCallback(
    async (planId, orderId) => {
      if (!orderId) {
        alert("orderId가 없습니다.");
        return;
      }

      if (!editForm.productCode?.trim()) {
        alert("제품을 선택하세요.");
        return;
      }

      const qty = Number(editForm.planQty);
      if (!qty || qty <= 0) {
        alert("Plan Qty는 1 이상 숫자여야 합니다.");
        return;
      }

      if (!editForm.targetLine?.trim()) {
        alert("Target Line을 입력하세요.");
        return;
      }

      try {
        const payload = {
          productId: editForm.productCode.trim(), // ⭐ code를 전송
          targetQty: qty,
          targetLine: editForm.targetLine.trim(),
        };

        await axiosInstance.put(`/api/mes/order/${orderId}`, payload);

        alert(`Plan [${planId}] 수정 저장 완료`);
        setEditingPlanId(null);
        fetchData();
      } catch (err) {
        console.error("수정 저장 실패:", err);
        alert("수정 저장 실패");
      }
    },
    [editForm, fetchData],
  );

  const handleFilterChange = useCallback((line) => {
    setFilterLine(line);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // =============================
  // Filtering
  // =============================
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      // ⭐ 핵심 수정 포인트
      const targetLine = (p.line ?? "").toUpperCase();

      const matchLine = filterLine === "ALL" || targetLine.includes(filterLine);

      const productName = (p.productName ?? "").toLowerCase();
      const productCode = (p.productCode ?? "").toLowerCase();
      const id = (p.id ?? "").toLowerCase();
      const keyword = (searchTerm ?? "").toLowerCase();

      const matchSearch =
        productName.includes(keyword) ||
        productCode.includes(keyword) ||
        id.includes(keyword);

      return matchLine && matchSearch;
    });
  }, [plans, filterLine, searchTerm]);

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
      <ControlBarSection
        filterLine={filterLine}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

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
              <PlanTableRow
                key={plan.id}
                plan={plan}
                isEditing={editingPlanId === plan.id}
                editForm={editForm}
                onEditStart={handleEditStart}
                onEditCancel={handleEditCancel}
                onEditSave={handleEditSave}
                onEditFormChange={handleEditFormChange}
                onRelease={handleRelease}
                onDelete={handleDelete}
                products={products}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductionPlanPage;

// =============================
// Styled Components
// =============================
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
        : props.$status === "IN_PROGRESS"
          ? "#ede7f6"
          : "#fff3e0"};
  color: ${(props) =>
    props.$status === "COMPLETED"
      ? "#2e7d32"
      : props.$status === "RELEASED"
        ? "#1976d2"
        : props.$status === "IN_PROGRESS"
          ? "#6a1b9a"
          : "#e67e22"};
`;

const Unit = styled.span`
  font-size: 11px;
  color: #999;
  margin-left: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

  &.save {
    color: #2e7d32;
    border-color: #2e7d32;

    &:hover {
      background: #e8f5e9;
    }
  }

  &.cancel {
    color: #555;
    border-color: #999;

    &:hover {
      background: #f5f5f5;
    }
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  background: #fff;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const EditSelect = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  background: #fff;

  &:focus {
    border-color: #1a4f8b;
  }
`;
