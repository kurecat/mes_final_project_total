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

/* =========================
   Mapper
========================= */
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
            { hour12: false, hour: "2-digit", minute: "2-digit" },
          )
        : "-",
    endTime:
      order.end_date || order.endDate
        ? new Date(order.end_date || order.endDate).toLocaleTimeString(
            "ko-KR",
            { hour12: false, hour: "2-digit", minute: "2-digit" },
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

/* =========================
   Header
========================= */
const ControlHeader = React.memo(
  ({ loading, lineFilter, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <Header>
        <TitleArea>
          <PageTitle>
            <FaIndustry /> Work Order Execution
            {loading && <FaSync className="spin" style={{ fontSize: 14 }} />}
          </PageTitle>
          <SubTitle>Production Line Monitoring & Control</SubTitle>
        </TitleArea>

        <ControlGroup>
          <FilterBox>
            <FaFilter color="#666" />
            <select value={lineFilter} onChange={onFilterChange}>
              <option value="ALL">All Processes</option>
              <option value="LINE">Line A</option>
              <option value="EDS">EDS</option>
              <option value="MOD">Module</option>
            </select>
          </FilterBox>

          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search WO / Product..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
        </ControlGroup>
      </Header>
    );
  },
);

/* =========================
   Card
========================= */
const OrderCardItem = React.memo(
  ({ order, type, onStatusUpdate, onDelete }) => {
    if (type === "ready") {
      return (
        <OrderCard>
          <CardTop>
            <OrderId>{order.woNumber}</OrderId>
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

            <ActionButton $type="delete" onClick={() => onDelete(order.id)}>
              <FaTrash />
            </ActionButton>

            <PrintButton>
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
              <FaExclamationCircle /> {order.issue}
            </IssueBox>
          )}

          <ActionFooter>
            {order.status === "IN_PROGRESS" ? (
              <ActionButton
                $type="pause"
                onClick={() => onStatusUpdate(order.id, "PAUSE_REQUEST")}
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
          <OrderId style={{ textDecoration: "line-through" }}>
            {order.woNumber}
          </OrderId>
          <FaCheck color="#2ecc71" />
        </CardTop>
        <ProdName>{order.product}</ProdName>
        <MetaInfo>
          Final: {order.actualQty.toLocaleString()} {order.unit}
        </MetaInfo>
        <MetaInfo>End: {order.endTime}</MetaInfo>
      </DoneCard>
    );
  },
);

/* =========================
   Column
========================= */
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

/* =========================
   Page
========================= */
const WorkOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 Pause Modal State
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseTargetId, setPauseTargetId] = useState(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true); // 처음엔 로딩 바를 보여주지만, 자동 갱신 시에는 생략 가능
    try {
      const res = await axiosInstance.get(`/api/mes/order`);
      setOrders(res.data);
    } catch (error) {
      console.error("데이터 갱신 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. 처음 마운트 시 데이터 로드
    fetchData();

    // 2. 5초마다 데이터 갱신 (5000ms = 5초)
    const intervalId = setInterval(() => {
      fetchData(true); // 자동 갱신은 사용자 모르게 'silent'하게 진행
    }, 5000);

    // 3. 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const updateStatus = useCallback(
    async (id, nextStatus) => {
      // 🔥 Pause는 모달
      if (nextStatus === "PAUSE_REQUEST") {
        setPauseTargetId(id);
        setPauseReason("");
        setPauseModalOpen(true);
        return;
      }

      try {
        await axiosInstance.patch(`/api/mes/order/${id}/status`, {
          status: nextStatus,
        });

        let actionType = "START";
        if (nextStatus === "PAUSED") actionType = "PAUSE";
        else if (nextStatus === "COMPLETED") actionType = "FINISH";

        await axiosInstance.post(`/api/mes/production-log/event`, {
          workOrderId: id,
          actionType,
        });

        fetchData();
      } catch (e) {
        // ✅ 여기서 백엔드 메시지 그대로 보여줌
        const msg =
          e.response?.data?.message ||
          e.response?.data ||
          "Release가 되지 않은 작업지시입니다.";

        alert(msg);
      }
    },
    [fetchData],
  );

  const savePauseReason = async () => {
    if (!pauseReason.trim()) {
      alert("중단 사유를 입력해주세요.");
      return;
    }

    await axiosInstance.patch(`/api/mes/order/${pauseTargetId}/status`, {
      status: "PAUSED",
    });

    await axiosInstance.post(`/api/mes/production-log/event`, {
      workOrderId: pauseTargetId,
      actionType: "PAUSE",
      message: pauseReason,
    });

    setPauseModalOpen(false);
    setPauseTargetId(null);
    setPauseReason("");
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await axiosInstance.delete(`/api/mes/order/${id}`);
    fetchData();
  };

  const { readyOrders, runningOrders, doneOrders } = useMemo(() => {
    const filtered = orders.filter((o) => {
      const matchLine =
        lineFilter === "ALL" || (o.targetLine || "").includes(lineFilter);
      const keyword = searchTerm.toLowerCase();
      return (
        matchLine &&
        ((o.workOrderNumber || "").toLowerCase().includes(keyword) ||
          (o.product?.code || "").toLowerCase().includes(keyword))
      );
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
        onFilterChange={(e) => setLineFilter(e.target.value)}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 🔥 Pause Modal */}
      {pauseModalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h3>
              <FaPause /> 작업 중단 사유
            </h3>

            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="중단 사유를 입력하세요"
            />

            <ModalActions>
              <ModalBtn $cancel onClick={() => setPauseModalOpen(false)}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={savePauseReason}>Save</ModalBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default WorkOrderPage;

/* =========================
   Styles
========================= */
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
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
  }
`;

const BoardContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
`;

const Column = styled.div`
  flex: 1;
  background: #e9ecef;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const ColHeader = styled.div`
  padding: 15px;
  background: white;
  border-top: 4px solid ${(p) => p.$color};
  display: flex;
  justify-content: space-between;
`;

const ColTitle = styled.h3`
  margin: 0;
`;

const CountBadge = styled.span`
  background: #eee;
  padding: 2px 8px;
  border-radius: 10px;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrderCard = styled(CardBase)``;

const ActiveCard = styled(CardBase)`
  border-left: 4px solid ${(p) => (p.$isPaused ? "#f39c12" : "#2ecc71")};
`;

const DoneCard = styled(CardBase)`
  opacity: 0.7;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OrderId = styled.span`
  font-size: 12px;
  font-weight: 700;
`;

const ProdName = styled.div`
  font-weight: 700;
`;

const LineInfo = styled.div`
  font-size: 12px;
  display: flex;
  gap: 5px;
`;

const MetaInfo = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 5px;
`;

const StatusTag = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(p) => (p.$status === "PAUSED" ? "#f39c12" : "#2ecc71")};
  color: white;
`;

const ProgressWrapper = styled.div`
  margin: 10px 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
`;

const ProgressFill = styled.div`
  width: ${(p) => p.$percent}%;
  height: 100%;
  background: ${(p) => (p.$paused ? "#f39c12" : "#2ecc71")};
`;

const IssueBox = styled.div`
  font-size: 12px;
  color: #c0392b;
  background: #fadbd8;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  gap: 6px;
`;

const ActionFooter = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 5px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  background: ${(p) =>
    p.$type === "start" || p.$type === "resume"
      ? "#2ecc71"
      : p.$type === "pause"
        ? "#f39c12"
        : p.$type === "finish"
          ? "#3498db"
          : "#e74c3c"};
`;

const PrintButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  width: 420px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalBtn = styled.button`
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  background: ${(p) => (p.$cancel ? "#95a5a6" : "#f39c12")};
`;
