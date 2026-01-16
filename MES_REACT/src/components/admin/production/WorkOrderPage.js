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

// --- Fallback Mock Data ---
const MOCK_ORDERS = [
  {
    id: "WO-FAB-240601-A",
    product: "DDR5 1znm Wafer Process",
    line: "Fab-Line-A",
    type: "FAB",
    status: "RUNNING",
    planQty: 25,
    actualQty: 12,
    unit: "wfrs",
    startTime: "06:30:00",
    progress: 48,
    priority: "HIGH",
  },
  {
    id: "WO-EDS-240601-B",
    product: "16Gb DDR5 SDRAM Test",
    line: "EDS-Line-02",
    type: "EDS",
    status: "PAUSED",
    planQty: 5000,
    actualQty: 1200,
    unit: "chips",
    startTime: "09:00:00",
    progress: 24,
    issue: "Yield Drop Alert",
    priority: "NORMAL",
  },
  {
    id: "WO-MOD-240601-C",
    product: "DDR5 32GB UDIMM Assy",
    line: "Mod-Line-C",
    type: "MOD",
    status: "DONE",
    planQty: 1000,
    actualQty: 1000,
    unit: "ea",
    startTime: "08:00:00",
    endTime: "14:20:00",
    progress: 100,
    priority: "NORMAL",
  },
  {
    id: "WO-FAB-240602-D",
    product: "LPDDR5X Mobile DRAM",
    line: "Fab-Line-A",
    type: "FAB",
    status: "READY",
    planQty: 50,
    actualQty: 0,
    unit: "wfrs",
    progress: 0,
    priority: "URGENT",
  },
];

const WorkOrderPage = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 데이터 조회 (READ)
  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API: http://localhost:3001/workOrders
      // const res = await axios.get("http://localhost:3001/workOrders");
      // setOrders(res.data);

      setTimeout(() => {
        setOrders(MOCK_ORDERS);
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

  // 2. 상태 변경 (UPDATE - PATCH)
  const updateStatus = async (id, newStatus) => {
    try {
      // 업데이트할 내용 계산
      const updates = { status: newStatus };
      if (newStatus === "RUNNING") {
        updates.startTime = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });
      }
      if (newStatus === "DONE") {
        updates.endTime = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });
        updates.progress = 100;
        // 완료 시 실제 수량을 계획 수량으로 맞춤 (데모용)
        const targetOrder = orders.find((o) => o.id === id);
        if (targetOrder) updates.actualQty = targetOrder.planQty;
      }

      // ★ 실제 API PATCH
      // await axios.patch(`http://localhost:3001/workOrders/${id}`, updates);
      // fetchData(); // 재조회

      // Mock 동작
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, ...updates } : order
        )
      );
    } catch (err) {
      console.error("Update Error", err);
    }
  };

  // 필터링
  const filteredOrders = orders.filter((o) => {
    const matchType = lineFilter === "ALL" || o.type === lineFilter;
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

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
                  Target: {order.planQty.toLocaleString()} {order.unit}
                </MetaInfo>
                <ActionFooter>
                  <ActionButton
                    $type="start"
                    onClick={() => updateStatus(order.id, "RUNNING")}
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
                  Final: {order.actualQty.toLocaleString()} {order.unit}
                </MetaInfo>
                <MetaInfo>End: {order.endTime}</MetaInfo>
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
