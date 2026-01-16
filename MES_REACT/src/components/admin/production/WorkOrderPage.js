// src/pages/production/WorkOrderPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
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
} from "react-icons/fa";

// =============================
// API Base
// =============================
const API_BASE = "http://localhost:8111/api/mes";

// =============================
// WorkOrder(Backend) -> WorkOrderPage(Card) 매핑
// =============================
const mapWorkOrderToCard = (wo) => {
  // 백엔드 status -> 화면 status 매핑
  // RELEASED => READY(Ready/Planned 칼럼)
  // IN_PROGRESS => RUNNING
  // COMPLETED => DONE
  // WAITING => WorkOrderPage에서는 안보이게 필터 처리할거라 여기서는 임시 READY 처리
  const status =
    wo.status === "RELEASED"
      ? "READY"
      : wo.status === "IN_PROGRESS"
      ? "RUNNING"
      : wo.status === "PAUSED" // ⭐ (추가) PAUSED 상태 매핑
      ? "PAUSED" // ⭐
      : wo.status === "COMPLETED"
      ? "DONE"
      : "READY";

  const planQty = wo.targetQty ?? 0;
  const actualQty = wo.currentQty ?? 0;

  // 시간 포맷(백엔드가 LocalDateTime ISO로 내려주는 경우)
  const startTime = wo.startDate
    ? wo.startDate.split("T")[1]?.split(".")[0]
    : "";

  const endTime = wo.endDate ? wo.endDate.split("T")[1]?.split(".")[0] : "";

  const progress =
    planQty > 0 ? Math.floor((Number(actualQty) / Number(planQty)) * 100) : 0;

  return {
    id: wo.workorderNumber || `WO-${wo.id}`,
    orderId: wo.id, // 필요하면 추후 API 호출용으로 사용 가능

    product: wo.productId || "",
    line: wo.targetLine || "Fab-Line-A",

    // 타입/공정 구분은 현재 백엔드에 없으므로 더미 처리
    type: "FAB",

    status,
    planQty,
    actualQty,
    unit: "ea",

    startTime,
    endTime,

    progress: progress > 100 ? 100 : progress,
    priority: "NORMAL",

    // 원본 status 보관(필터용)
    rawStatus: wo.status,
  };
};

const WorkOrderPage = () => {
  const [orders, setOrders] = useState([]); // MOCK 제거하고 API 기반으로
  const [loading, setLoading] = useState(true);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // =============================
  // 1) 데이터 조회 (READ)
  // =============================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/order`);
      const mapped = (res.data || []).map(mapWorkOrderToCard);

      // ✅ WorkOrderPage에서는 RELEASED/IN_PROGRESS/COMPLETED 만 보여줌
      // (WAITING은 ProductionPlanPage에서 관리)
      const filtered = mapped.filter(
        (o) =>
          o.rawStatus === "RELEASED" ||
          o.rawStatus === "IN_PROGRESS" ||
          o.rawStatus === "PAUSED" || // ⭐ (추가)
          o.rawStatus === "COMPLETED"
      );

      setOrders(filtered);
    } catch (err) {
      console.error("WorkOrder 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 2) 자동 갱신 (폴링)
  // ProductionPlanPage에서 Release하면
  // WorkOrderPage는 자동으로 READY 칼럼에 추가되어 보여야 함
  // =============================
  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // =============================
  // (현재는 UI 데모용) 상태 변경 함수
  // 실제 MES에서는 C# 설비가 poll/report로 바꾸는게 정석
  // =============================
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/order/${orderId}/status`, {
        status: newStatus,
      }); // ⭐

      // 저장 성공 후 다시 조회해서 UI 갱신
      fetchData(); // ⭐
    } catch (err) {
      console.error("상태 변경 실패:", err); // ⭐
      alert("상태 변경 실패"); // ⭐
    }
  };

  // =============================
  // 필터링 (안전하게 toLowerCase 처리)
  // =============================
  const filteredOrders = orders.filter((o) => {
    const matchType = lineFilter === "ALL" || o.type === lineFilter;

    const id = (o.id ?? "").toLowerCase();
    const product = (o.product ?? "").toLowerCase();
    const keyword = (searchTerm ?? "").toLowerCase();

    const matchSearch = id.includes(keyword) || product.includes(keyword);

    return matchType && matchSearch;
  });

  // 칸반 분류
  const readyOrders = filteredOrders.filter((o) => o.status === "READY");
  const runningOrders = filteredOrders.filter(
    (o) => o.status === "RUNNING" || o.status === "PAUSED"
  );
  const doneOrders = filteredOrders.filter((o) => o.status === "DONE");

  return (
    <Container>
      {/* 1. 헤더 */}
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
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
            >
              <option value="ALL">All Processes</option>
              <option value="FAB">Fab (Wafer)</option>
              <option value="EDS">EDS (Test)</option>
              <option value="MOD">Module (SMT)</option>
            </select>
          </FilterBox>

          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search WO ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </ControlGroup>
      </Header>

      {/* 2. 칸반 보드 */}
      <BoardContainer>
        {/* Column 1: Ready */}
        <Column>
          <ColHeader $color="#f39c12">
            <ColTitle>Ready / Planned</ColTitle>
            <CountBadge>{readyOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {readyOrders.map((order) => (
              <OrderCard key={order.id} $priority={order.priority}>
                <CardTop>
                  <OrderId>{order.id}</OrderId>
                  <PriorityBadge $level={order.priority}>
                    {order.priority}
                  </PriorityBadge>
                </CardTop>

                <ProdName>{order.product}</ProdName>

                <LineInfo>
                  <FaMicrochip /> {order.line}
                </LineInfo>

                <MetaInfo>
                  Target: {Number(order.planQty).toLocaleString()} {order.unit}
                </MetaInfo>

                <ActionFooter>
                  <ActionButton
                    $type="start"
                    onClick={() => updateStatus(order.orderId, "IN_PROGRESS")}
                  >
                    <FaPlay /> Start
                  </ActionButton>

                  <PrintButton title="Print Lot Card">
                    <FaPrint />
                  </PrintButton>
                </ActionFooter>
              </OrderCard>
            ))}
          </CardList>
        </Column>

        {/* Column 2: Running (Main) */}
        <Column style={{ flex: 1.2 }}>
          <ColHeader $color="#2ecc71">
            <ColTitle>Running / In-Progress</ColTitle>
            <CountBadge>{runningOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {runningOrders.map((order) => (
              <ActiveCard key={order.id} $isPaused={order.status === "PAUSED"}>
                <CardTop>
                  <OrderId>{order.id}</OrderId>
                  <StatusTag $status={order.status}>{order.status}</StatusTag>
                </CardTop>

                <ProdName>{order.product}</ProdName>

                <MetaInfo>
                  <FaClock size={12} /> Started:{" "}
                  {order.startTime ? order.startTime : "-"}
                </MetaInfo>

                <ProgressWrapper>
                  <ProgressLabel>
                    <span>
                      {Number(order.actualQty).toLocaleString()} /{" "}
                      {Number(order.planQty).toLocaleString()} {order.unit}
                    </span>
                    <span>{order.progress}%</span>
                  </ProgressLabel>

                  <ProgressBar>
                    <ProgressFill
                      $percent={order.progress}
                      $paused={order.status === "PAUSED"}
                    />
                  </ProgressBar>
                </ProgressWrapper>

                {order.status === "PAUSED" && (
                  <IssueBox>
                    <FaExclamationCircle /> {order.issue || "Line Paused"}
                  </IssueBox>
                )}

                <ActionFooter>
                  {order.status === "RUNNING" ? (
                    <ActionButton
                      $type="pause"
                      onClick={() => updateStatus(order.orderId, "PAUSED")}
                    >
                      <FaPause /> Pause
                    </ActionButton>
                  ) : (
                    <ActionButton
                      $type="resume"
                      onClick={() => updateStatus(order.orderId, "IN_PROGRESS")}
                    >
                      <FaPlay /> Resume
                    </ActionButton>
                  )}

                  <ActionButton
                    $type="finish"
                    onClick={() => updateStatus(order.orderId, "COMPLETED")}
                  >
                    <FaCheck /> Finish
                  </ActionButton>
                </ActionFooter>
              </ActiveCard>
            ))}
          </CardList>
        </Column>

        {/* Column 3: Completed */}
        <Column>
          <ColHeader $color="#3498db">
            <ColTitle>Completed</ColTitle>
            <CountBadge>{doneOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {doneOrders.map((order) => (
              <DoneCard key={order.id}>
                <CardTop>
                  <OrderId
                    style={{ textDecoration: "line-through", color: "#999" }}
                  >
                    {order.id}
                  </OrderId>
                  <FaCheck color="#2ecc71" />
                </CardTop>

                <ProdName style={{ color: "#666" }}>{order.product}</ProdName>

                <MetaInfo>
                  Final: {Number(order.actualQty).toLocaleString()} {order.unit}
                </MetaInfo>

                <MetaInfo>End: {order.endTime ? order.endTime : "-"}</MetaInfo>
              </DoneCard>
            ))}
          </CardList>
        </Column>
      </BoardContainer>
    </Container>
  );
};

export default WorkOrderPage;

// --- Styled Components ---

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
  font-size: 22px;
  color: #333;
  margin: 0;
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
