// src/pages/production/WorkOrderPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaPlay,
  FaPause,
  FaCheck,
  FaPrint,
  FaSearch,
  FaFilter,
  FaIndustry,
  FaClock,
  FaEllipsisV,
} from "react-icons/fa";

// --- Mock Data (작업 지시 목록) ---
const INITIAL_ORDERS = [
  {
    id: "WO-240520-001",
    product: "HBM3 8-Hi Stack Module",
    line: "Line-A",
    status: "RUNNING", // RUNNING, PAUSED, READY, DONE
    planQty: 500,
    actualQty: 245,
    startTime: "08:30:00",
    endTime: null,
    worker: "Kim",
    progress: 49,
  },
  {
    id: "WO-240520-002",
    product: "HBM3 12-Hi Stack",
    line: "Line-A",
    status: "READY",
    planQty: 300,
    actualQty: 0,
    startTime: null,
    endTime: null,
    worker: "-",
    progress: 0,
  },
  {
    id: "WO-240520-003",
    product: "DDR5 32GB UDIMM",
    line: "Line-C",
    status: "DONE",
    planQty: 1000,
    actualQty: 1000,
    startTime: "08:00:00",
    endTime: "11:45:00",
    worker: "Lee",
    progress: 100,
  },
  {
    id: "WO-240520-004",
    product: "Package Substrate Assy",
    line: "Line-B",
    status: "PAUSED",
    planQty: 450,
    actualQty: 120,
    startTime: "09:00:00",
    endTime: null,
    worker: "Park",
    progress: 26,
    issue: "Material Shortage", // 일시정지 사유
  },
  {
    id: "WO-240520-005",
    product: "Logic Die Test",
    line: "Line-C",
    status: "READY",
    planQty: 2000,
    actualQty: 0,
    startTime: null,
    endTime: null,
    worker: "-",
    progress: 0,
  },
];

const WorkOrderPage = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [lineFilter, setLineFilter] = useState("ALL");

  // 상태 변경 핸들러
  const updateStatus = (id, newStatus) => {
    const updated = orders.map((order) => {
      if (order.id === id) {
        // 실제로는 API 호출 및 시간 기록 로직 필요
        let updates = { status: newStatus };
        if (newStatus === "RUNNING" && !order.startTime) {
          updates.startTime = new Date().toLocaleTimeString();
        }
        if (newStatus === "DONE") {
          updates.endTime = new Date().toLocaleTimeString();
          updates.actualQty = order.planQty; // Mock: 완료 시 수량 채움
          updates.progress = 100;
        }
        return { ...order, ...updates };
      }
      return order;
    });
    setOrders(updated);
  };

  // 필터링
  const filteredOrders = orders.filter(
    (o) => lineFilter === "ALL" || o.line === lineFilter
  );

  // 컬럼별 데이터 분리
  const readyOrders = filteredOrders.filter((o) => o.status === "READY");
  const runningOrders = filteredOrders.filter(
    (o) => o.status === "RUNNING" || o.status === "PAUSED"
  );
  const doneOrders = filteredOrders.filter((o) => o.status === "DONE");

  return (
    <Container>
      {/* 1. 헤더 및 컨트롤 바 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaIndustry /> Work Order Execution
          </PageTitle>
          <SubTitle>현장 작업 지시 및 실적 등록</SubTitle>
        </TitleArea>
        <ControlGroup>
          <FilterBox>
            <FaFilter color="#666" />
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
            >
              <option value="ALL">All Lines</option>
              <option value="Line-A">Line-A (Stacking)</option>
              <option value="Line-B">Line-B (Pkg)</option>
              <option value="Line-C">Line-C (Test)</option>
            </select>
          </FilterBox>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input placeholder="Search Order ID..." />
          </SearchBox>
        </ControlGroup>
      </Header>

      {/* 2. 칸반 보드 영역 */}
      <BoardContainer>
        {/* Column 1: Ready (대기) */}
        <Column>
          <ColHeader $color="#f39c12">
            <ColTitle>Ready / Planned</ColTitle>
            <CountBadge>{readyOrders.length}</CountBadge>
          </ColHeader>
          <CardList>
            {readyOrders.map((order) => (
              <OrderCard key={order.id}>
                <CardTop>
                  <OrderId>{order.id}</OrderId>
                  <LineBadge>{order.line}</LineBadge>
                </CardTop>
                <ProdName>{order.product}</ProdName>
                <MetaInfo>Target: {order.planQty.toLocaleString()} ea</MetaInfo>
                <ActionFooter>
                  <ActionButton
                    $type="start"
                    onClick={() => updateStatus(order.id, "RUNNING")}
                  >
                    <FaPlay /> Start
                  </ActionButton>
                  <PrintButton>
                    <FaPrint />
                  </PrintButton>
                </ActionFooter>
              </OrderCard>
            ))}
          </CardList>
        </Column>

        {/* Column 2: Running (진행중) - 가장 넓게 배치 */}
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
                  <FaClock size={12} /> Started at {order.startTime}
                </MetaInfo>

                {/* 진행률 바 */}
                <ProgressWrapper>
                  <ProgressLabel>
                    <span>
                      {order.actualQty} / {order.planQty}
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
                  <IssueBox>Reason: {order.issue}</IssueBox>
                )}

                <ActionFooter>
                  {order.status === "RUNNING" ? (
                    <ActionButton
                      $type="pause"
                      onClick={() => updateStatus(order.id, "PAUSED")}
                    >
                      <FaPause /> Pause
                    </ActionButton>
                  ) : (
                    <ActionButton
                      $type="resume"
                      onClick={() => updateStatus(order.id, "RUNNING")}
                    >
                      <FaPlay /> Resume
                    </ActionButton>
                  )}

                  <ActionButton
                    $type="finish"
                    onClick={() => updateStatus(order.id, "DONE")}
                  >
                    <FaCheck /> Finish
                  </ActionButton>
                </ActionFooter>
              </ActiveCard>
            ))}
          </CardList>
        </Column>

        {/* Column 3: Completed (완료) */}
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
                  <FaCheckCircle />
                </CardTop>
                <ProdName style={{ color: "#666" }}>{order.product}</ProdName>
                <MetaInfo>Final Qty: {order.actualQty}</MetaInfo>
                <MetaInfo>End Time: {order.endTime}</MetaInfo>
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

// Kanban Board Layout
const BoardContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden; /* 보드 전체 스크롤 방지, 컬럼 내부 스크롤 사용 */
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

// Card Styles
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
  border-left: 3px solid #ccc;
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

const LineBadge = styled.span`
  font-size: 11px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  color: #555;
`;

const ProdName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
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

// Progress Bar
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
  padding: 5px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

// Footer Buttons
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
  transition: opacity 0.2s;

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

const FaCheckCircle = styled(FaCheck)`
  color: #2ecc71;
`;
