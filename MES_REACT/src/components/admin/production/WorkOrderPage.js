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

const mapOrder = (order) => {
  return {
    id: order.id,
    woNumber: order.workorder_number || order.workOrderNumber,
    product: order.productId || (order.product && order.product.code),
    line: order.targetLine,
    status: order.status,
    planQty: order.targetQty ?? 0,
    actualQty: order.currentQty ?? 0,
    unit: "pcs",
    startTime:
      order.start_date || order.startDate
        ? new Date(order.start_date || order.startDate).toLocaleTimeString(
            "ko-KR",
            {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            },
          )
        : "-",
    endTime:
      order.end_date || order.endDate
        ? new Date(order.end_date || order.endDate).toLocaleTimeString(
            "ko-KR",
            {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            },
          )
        : "-",
    progress:
      order.targetQty > 0
        ? Math.floor(((order.currentQty ?? 0) / order.targetQty) * 100)
        : 0,
    priority: "NORMAL",
    issue: order.status === "PAUSED" ? "작업 중단됨" : "",
  };
};

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
          <SubTitle>Production Line Monitoring & Control</SubTitle>
        </TitleArea>

        <ControlGroup>
          <FilterBox>
            <FaFilter color="#666" />
            <select value={lineFilter} onChange={onFilterChange}>
              <option value="ALL">All Processes</option>
              <option value="LINE">Line A</option>
              <option value="EDS">EDS (Test)</option>
              <option value="MOD">Module</option>
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

const OrderCardItem = React.memo(
  ({ order, type, onStatusUpdate, onDelete }) => {
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
              onClick={() => onStatusUpdate(order.id, "IN_PROGRESS")}
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
                onClick={() => onStatusUpdate(order.id, "IN_PROGRESS")}
              >
                <FaPlay /> Resume
              </ActionButton>
            )}

            <ActionButton
              $type="finish"
              onClick={() => onStatusUpdate(order.id, "COMPLETED")}
            >
              <FaCheck /> Finish
            </ActionButton>
          </ActionFooter>
        </ActiveCard>
      );
    }

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
              key={raw.id}
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

const WorkOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/mes/order`);
      setOrders(res.data);
    } catch (err) {
      console.error("조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = useCallback(
    async (id, nextStatus) => {
      try {
        await axiosInstance.patch(`/api/mes/order/${id}/status`, {
          status: nextStatus,
        });

        let actionType = "START";
        if (nextStatus === "PAUSED") actionType = "PAUSE";
        else if (nextStatus === "COMPLETED") actionType = "FINISH";

        try {
          await axiosInstance.post(`/api/mes/production-log/event`, {
            workOrderId: id,
            actionType: actionType,
          });
        } catch (logErr) {
          console.error("로그 기록 실패:", logErr);
        }

        fetchData();
      } catch (e) {
        const msg =
          e.response?.data?.message ||
          e.response?.data ||
          "Release가 되지 않은 작업지시입니다.";

        alert(msg);
      }
    },
    [fetchData],
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("삭제하시겠습니까?")) return;
      try {
        await axiosInstance.delete(`/api/mes/order/${id}`);
        await fetchData();
      } catch (err) {
        alert("삭제 실패");
      }
    },
    [fetchData],
  );

  const handleFilterChange = useCallback(
    (e) => setLineFilter(e.target.value),
    [],
  );
  const handleSearchChange = useCallback(
    (e) => setSearchTerm(e.target.value),
    [],
  );

  const { readyOrders, runningOrders, doneOrders } = useMemo(() => {
    const filtered = orders.filter((o) => {
      const matchType =
        lineFilter === "ALL" || (o.targetLine || "").includes(lineFilter);
      const keyword = searchTerm.toLowerCase();
      const matchSearch =
        (o.workOrderNumber || o.workorder_number || "")
          .toLowerCase()
          .includes(keyword) ||
        (o.productId || (o.product && o.product.code) || "")
          .toLowerCase()
          .includes(keyword);
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
        <KanbanColumn
          title="Ready"
          color="#f39c12"
          orders={readyOrders}
          type="ready"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
        <KanbanColumn
          title="Running"
          color="#2ecc71"
          orders={runningOrders}
          type="running"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
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
`;
const OrderCard = styled(CardBase)`
  border-left: 3px solid
    ${(props) => (props.$priority === "URGENT" ? "#e74c3c" : "#ccc")};
`;
const ActiveCard = styled(CardBase)`
  border-left: 4px solid ${(props) => (props.$isPaused ? "#f39c12" : "#2ecc71")};
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
  background-color: #eee;
  color: #555;
`;
const ProdName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
`;
const LineInfo = styled.div`
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
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
  display: flex;
  align-items: center;
  gap: 6px;
`;
const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
`;
const ActionButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  background-color: ${(props) =>
    props.$type === "start" || props.$type === "resume"
      ? "#2ecc71"
      : props.$type === "pause"
        ? "#f39c12"
        : props.$type === "finish"
          ? "#3498db"
          : "#e74c3c"};
`;
const PrintButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
`;

export default WorkOrderPage;
