// src/pages/production/WorkOrderPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaPlay,
  FaPause,
  FaCheck,
  FaPrint,
  FaSearch,
  FaFilter,
  FaIndustry,
  FaClock,
  FaExclamationCircle,
  FaMicrochip,
  FaSync,
  FaTrash,
} from "react-icons/fa";

const API_BASE = "http://localhost:8111/api/mes";

// --- Helper: Map Order Data ---
const mapOrder = (order) => {
  return {
    id: order.id,
    woNumber: order.workorder_number,
    product: order.productId,
    line: order.targetLine,
    status: order.status,
    planQty: order.targetQty ?? 0,
    actualQty: order.currentQty ?? 0,
    unit: "-",
    startTime: order.start_date
      ? new Date(order.start_date).toLocaleTimeString("en-US", {
          hour12: false,
        })
      : "-",
    endTime: order.end_date
      ? new Date(order.end_date).toLocaleTimeString("en-US", {
          hour12: false,
        })
      : "-",
    progress:
      order.targetQty > 0
        ? Math.floor(((order.currentQty ?? 0) / order.targetQty) * 100)
        : 0,
    priority: "NORMAL",
    issue: "",
  };
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Control Component
const ControlHeader = React.memo(
  ({ loading, lineFilter, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <Header>
        <TitleArea>
          <PageTitle>
            <FaIndustry /> Work Order Execution
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Fab / EDS / Module Shop Floor Control</SubTitle>
        </TitleArea>

        <ControlGroup>
          <FilterBox>
            <FaFilter color="#666" />
            <select value={lineFilter} onChange={onFilterChange}>
              <option value="ALL">All Processes</option>
              <option value="FAB">Fab (Wafer)</option>
              <option value="EDS">EDS (Test)</option>
              <option value="MOD">Module (SMT)</option>
            </select>
          </FilterBox>

          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search WO ID / Product..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
        </ControlGroup>
      </Header>
    );
  },
);

// 2. Order Card Item Component
const OrderCardItem = React.memo(
  ({ order, type, onStatusUpdate, onDelete }) => {
    // type: 'ready' | 'running' | 'done'

    if (type === "ready") {
      return (
        <OrderCard $priority={order.priority}>
          <CardTop>
            <OrderId>{order.woNumber}</OrderId>
            <PriorityBadge $level={order.priority}>
              {order.priority}
            </PriorityBadge>
          </CardTop>

          <ProdName>{order.product}</ProdName>
          <LineInfo>
            <FaMicrochip /> {order.line}
          </LineInfo>

          <MetaInfo>
            Target: {order.planQty.toLocaleString()} {order.unit}
          </MetaInfo>

          <ActionFooter>
            <ActionButton
              $type="start"
              onClick={() => onStatusUpdate(order.id, "RUNNING")}
            >
              <FaPlay /> Start
            </ActionButton>

            <ActionButton
              $type="delete"
              onClick={() => onDelete(order.id)}
              title="Delete Order"
            >
              <FaTrash />
            </ActionButton>

            <PrintButton title="Print Lot Card">
              <FaPrint />
            </PrintButton>
          </ActionFooter>
        </OrderCard>
      );
    }

    if (type === "running") {
      const isPaused = order.status === "PAUSED";
      return (
        <ActiveCard $isPaused={isPaused}>
          <CardTop>
            <OrderId>{order.woNumber}</OrderId>
            <StatusTag $status={order.status}>{order.status}</StatusTag>
          </CardTop>

          <ProdName>{order.product}</ProdName>
          <MetaInfo>
            <FaClock size={12} /> Started: {order.startTime}
          </MetaInfo>

          <ProgressWrapper>
            <ProgressLabel>
              <span>
                {order.actualQty.toLocaleString()} /{" "}
                {order.planQty.toLocaleString()} {order.unit}
              </span>
              <span>{order.progress}%</span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill $percent={order.progress} $paused={isPaused} />
            </ProgressBar>
          </ProgressWrapper>

          {isPaused && (
            <IssueBox>
              <FaExclamationCircle /> {order.issue || "Line Paused"}
            </IssueBox>
          )}

          <ActionFooter>
            {order.status === "IN_PROGRESS" ? (
              <ActionButton
                $type="pause"
                onClick={() => onStatusUpdate(order.id, "PAUSED")}
              >
                <FaPause /> Pause
              </ActionButton>
            ) : (
              <ActionButton
                $type="resume"
                onClick={() => onStatusUpdate(order.id, "RUNNING")}
              >
                <FaPlay /> Resume
              </ActionButton>
            )}

            <ActionButton
              $type="finish"
              onClick={() => onStatusUpdate(order.id, "DONE")}
            >
              <FaCheck /> Finish
            </ActionButton>
          </ActionFooter>
        </ActiveCard>
      );
    }

    // Done Card
    return (
      <DoneCard>
        <CardTop>
          <OrderId style={{ textDecoration: "line-through", color: "#999" }}>
            {order.woNumber}
          </OrderId>
          <FaCheck color="#2ecc71" />
        </CardTop>

        <ProdName style={{ color: "#666" }}>{order.product}</ProdName>

        <MetaInfo>
          Final: {order.actualQty.toLocaleString()} {order.unit}
        </MetaInfo>

        <MetaInfo>End: {order.endTime}</MetaInfo>
      </DoneCard>
    );
  },
);

// 3. Kanban Column Component
const KanbanColumn = React.memo(
  ({ title, color, orders, type, onStatusUpdate, onDelete }) => {
    return (
      <Column>
        <ColHeader $color={color}>
          <ColTitle>{title}</ColTitle>
          <CountBadge>{orders.length}</CountBadge>
        </ColHeader>
        <CardList>
          {orders.map((raw) => (
            <OrderCardItem
              key={raw.id} // 백엔드 ID 사용
              order={mapOrder(raw)}
              type={type}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
            />
          ))}
        </CardList>
      </Column>
    );
  },
);

// --- Main Component ---

const WorkOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1) 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_BASE}/order`);
      setOrders(res.data);
    } catch (err) {
      console.error("작업지시 조회 실패:", err);
      // alert("작업지시 조회 실패"); // 반복 호출 시 알림 방지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2) 상태 변경 (UPDATE) - useCallback
  const updateStatus = useCallback(
    async (id, newStatus) => {
      try {
        let nextStatus = newStatus;
        if (newStatus === "RUNNING") nextStatus = "IN_PROGRESS";
        if (newStatus === "DONE") nextStatus = "COMPLETED";
        if (newStatus === "PAUSED") nextStatus = "PAUSED";

        await axiosInstance.patch(`${API_BASE}/order/${id}/status`, {
          status: nextStatus,
        });
        await fetchData();
      } catch (err) {
        console.error("Update Error", err);
        alert(
          "상태 변경 실패: " + (err.response?.data?.message || err.message),
        );
      }
    },
    [fetchData],
  );

  // 3) 삭제 (DELETE) - useCallback
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("정말 이 작업 지시를 삭제하시겠습니까?")) return;
      try {
        await axiosInstance.delete(`${API_BASE}/order/${id}`);
        alert("삭제 완료");
        await fetchData();
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("삭제 실패: " + (err.response?.data?.message || err.message));
      }
    },
    [fetchData],
  );

  const handleFilterChange = useCallback((e) => {
    setLineFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // 4) Filtering Logic - useMemo
  const { readyOrders, runningOrders, doneOrders } = useMemo(() => {
    const filtered = orders.filter((o) => {
      const matchType =
        lineFilter === "ALL" ||
        (o.targetLine || "").toUpperCase().includes(lineFilter);

      const keyword = searchTerm.toLowerCase();
      const matchSearch =
        (o.workorder_number || "").toLowerCase().includes(keyword) ||
        (o.productId || "").toLowerCase().includes(keyword);

      return matchType && matchSearch;
    });

    return {
      readyOrders: filtered.filter(
        (o) => o.status === "WAITING" || o.status === "RELEASED",
      ),
      runningOrders: filtered.filter(
        (o) => o.status === "IN_PROGRESS" || o.status === "PAUSED",
      ),
      doneOrders: filtered.filter((o) => o.status === "COMPLETED"),
    };
  }, [orders, lineFilter, searchTerm]);

  return (
    <Container>
      <ControlHeader
        loading={loading}
        lineFilter={lineFilter}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <BoardContainer>
        {/* Column 1: Ready */}
        <KanbanColumn
          title="Ready / Planned"
          color="#f39c12"
          orders={readyOrders}
          type="ready"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />

        {/* Column 2: Running */}
        <KanbanColumn
          title="Running / In-Progress"
          color="#2ecc71"
          orders={runningOrders}
          type="running"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />

        {/* Column 3: Completed */}
        <KanbanColumn
          title="Completed"
          color="#3498db"
          orders={doneOrders}
          type="done"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
      </BoardContainer>
    </Container>
  );
};

export default WorkOrderPage;

// --- Styled Components (No Changes) ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 22px;
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

const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const FilterBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  select {
    border: none;
    outline: none;
    padding: 8px;
    font-size: 14px;
    color: #555;
    background: transparent;
  }
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
    outline: none;
    margin-left: 8px;
    font-size: 14px;
  }
`;

const BoardContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
`;
const Column = styled.div`
  flex: 1;
  background: #e9ecef;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const ColHeader = styled.div`
  padding: 15px;
  background: white;
  border-top: 4px solid ${(props) => props.$color};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
`;
const ColTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;
const CountBadge = styled.span`
  background: #eee;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #555;
`;

const CardList = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CardBase = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.1s;
`;

const OrderCard = styled(CardBase)`
  border-left: 3px solid
    ${(props) => (props.$priority === "URGENT" ? "#e74c3c" : "#ccc")};
  &:hover {
    transform: translateY(-2px);
  }
`;
const ActiveCard = styled(CardBase)`
  border-left: 4px solid ${(props) => (props.$isPaused ? "#f39c12" : "#2ecc71")};
  border: ${(props) =>
    props.$isPaused ? "1px solid #f39c12" : "1px solid #2ecc71"};
  background-color: ${(props) => (props.$isPaused ? "#fffaf0" : "white")};
`;
const DoneCard = styled(CardBase)`
  opacity: 0.7;
  background-color: #f8f9fa;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const OrderId = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #1a4f8b;
`;
const PriorityBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$level === "URGENT"
      ? "#ffebee"
      : props.$level === "HIGH"
        ? "#e3f2fd"
        : "#eee"};
  color: ${(props) =>
    props.$level === "URGENT"
      ? "#c62828"
      : props.$level === "HIGH"
        ? "#1976d2"
        : "#555"};
`;
const ProdName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
`;
const LineInfo = styled.div`
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
`;
const MetaInfo = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusTag = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "PAUSED" ? "#f39c12" : "#2ecc71"};
  color: white;
`;

const ProgressWrapper = styled.div`
  margin: 10px 0;
`;
const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
  font-weight: 600;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background-color: ${(props) => (props.$paused ? "#f39c12" : "#2ecc71")};
  transition: width 0.3s ease;
`;

const IssueBox = styled.div`
  font-size: 12px;
  color: #c0392b;
  background: #fadbd8;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  background-color: ${(props) =>
    props.$type === "start" || props.$type === "resume"
      ? "#2ecc71"
      : props.$type === "pause"
        ? "#f39c12"
        : props.$type === "finish"
          ? "#3498db"
          : props.$type === "delete"
            ? "#e74c3c"
            : "#ccc"};
  &:hover {
    opacity: 0.9;
  }
`;
const PrintButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  color: #555;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;
