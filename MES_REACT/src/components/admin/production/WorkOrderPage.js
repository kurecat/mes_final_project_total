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
  FaTrash,
} from "react-icons/fa";

// ❌ MOCK 데이터는 더 이상 필요 없음 (DB 연동이므로)
// const MOCK_ORDERS = [...]

const WorkOrderPage = () => {
  // ✅ 수정: localStorage 기반 상태 초기화 제거 → 빈 배열로 시작
  const [orders, setOrders] = useState([]); // ✅ 수정
  const [loading, setLoading] = useState(false);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ 수정: API_BASE 추가 (백엔드 MesController 경로)
  const API_BASE = "http://localhost:8111/api/mes"; // ✅ 수정

  // ❌ localStorage 저장 제거 (DB가 기준)
  // useEffect(() => {
  //   localStorage.setItem("workOrders", JSON.stringify(orders));
  // }, [orders]);

  // ✅ 수정: 실제 작업지시 목록 조회 API 호출
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/order`); // ✅ 수정
      // res.data는 WorkOrderResDto 리스트 형태
      setOrders(res.data); // ✅ 수정
    } catch (err) {
      console.error("작업지시 조회 실패:", err);
      alert("작업지시 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ 수정: 상태 변경도 백엔드 API 호출하도록 변경
  const updateStatus = async (id, newStatus) => {
    try {
      // 프론트에서 쓰던 RUNNING/DONE은 백엔드에 없음
      // 백엔드 기준 상태로 변환해서 호출해야 함

      // ✅ 수정: 프론트 액션 → 백엔드 상태로 매핑
      let nextStatus = newStatus; // 기본

      if (newStatus === "RUNNING") nextStatus = "IN_PROGRESS"; // ✅ 수정
      if (newStatus === "DONE") nextStatus = "COMPLETED"; // ✅ 수정

      // PAUSED는 백엔드에 updateWorkOrderStatus가 있으니 가능하지만
      // 지금 start/finish API도 있어서 선택 가능
      if (newStatus === "PAUSED") nextStatus = "PAUSED"; // ✅ 수정

      // ✅ 수정: 상태 변경 API 호출 (Patch)
      await axios.patch(`${API_BASE}/order/${id}/status`, {
        status: nextStatus,
      });

      // ✅ 수정: 성공하면 재조회해서 화면 반영
      await fetchData();
    } catch (err) {
      console.error("Update Error", err);
      alert("상태 변경 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ✅ 수정: 삭제도 백엔드 DELETE API 호출
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 작업 지시를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE}/order/${id}`); // ✅ 수정
      alert("삭제 완료");
      await fetchData(); // ✅ 수정
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ✅ 수정: 서버에서 내려오는 DTO 필드명에 맞게 검색 기준 수정
  // WorkOrderResDto에 id/workorder_number/productId/targetQty/status/targetLine 등이 있을 가능성이 큼
  const filteredOrders = orders.filter((o) => {
    // ✅ 수정: lineFilter는 FAB/EDS/MOD를 type으로 보던 구조였는데
    // 서버는 targetLine 문자열을 주므로 포함 여부로 처리
    const matchType =
      lineFilter === "ALL" ||
      (o.targetLine || "").toUpperCase().includes(lineFilter);

    // ✅ 수정: 검색 대상도 서버 필드에 맞게 변경
    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      (o.workorder_number || "").toLowerCase().includes(keyword) ||
      (o.productId || "").toLowerCase().includes(keyword);

    return matchType && matchSearch;
  });

  // ✅ 수정: READY/PLANNED는 서버 상태(WAITING/RELEASED)로 잡아야 함
  const readyOrders = filteredOrders.filter(
    (o) => o.status === "WAITING" || o.status === "RELEASED" // ✅ 수정
  );

  // ✅ 수정: Running은 IN_PROGRESS(+PAUSED 있으면 포함)
  const runningOrders = filteredOrders.filter(
    (o) => o.status === "IN_PROGRESS" || o.status === "PAUSED" // ✅ 수정
  );

  // ✅ 수정: 완료는 COMPLETED
  const doneOrders = filteredOrders.filter((o) => o.status === "COMPLETED"); // ✅ 수정

  // ✅ 수정: 화면에서 표시할 데이터 필드 매핑 함수(프론트 UI 유지용)
  const mapOrder = (order) => {
    return {
      // UI에서 order.id로 key를 쓰고 있으니 백엔드 id를 그대로 사용
      id: order.id, // ✅ 수정
      // UI 상단 WO 번호 표시
      woNumber: order.workorder_number, // ✅ 수정
      product: order.productId, // ✅ 수정 (productName 있으면 그걸로 교체 가능)
      line: order.targetLine, // ✅ 수정
      status: order.status, // ✅ 수정
      planQty: order.targetQty ?? 0, // ✅ 수정
      actualQty: order.currentQty ?? 0, // ✅ 수정
      unit: "-", // 서버에 unit 없으면 "-" 처리
      startTime: order.start_date
        ? new Date(order.start_date).toLocaleTimeString("en-US", {
            hour12: false,
          })
        : "-", // ✅ 수정
      endTime: order.end_date
        ? new Date(order.end_date).toLocaleTimeString("en-US", {
            hour12: false,
          })
        : "-", // ✅ 수정
      progress:
        order.targetQty > 0
          ? Math.floor(((order.currentQty ?? 0) / order.targetQty) * 100)
          : 0, // ✅ 수정
      priority: "NORMAL", // 서버에 없으면 기본값
      issue: "",
    };
  };

  return (
    <Container>
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
              placeholder="Search WO ID / Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </ControlGroup>
      </Header>

      <BoardContainer>
        {/* Column 1: Ready */}
        <Column>
          <ColHeader $color="#f39c12">
            <ColTitle>Ready / Planned</ColTitle>
            <CountBadge>{readyOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {readyOrders.map((raw) => {
              const order = mapOrder(raw); // ✅ 수정
              return (
                <OrderCard key={order.id} $priority={order.priority}>
                  <CardTop>
                    <OrderId>{order.woNumber}</OrderId> {/* ✅ 수정 */}
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

                    <ActionButton
                      $type="delete"
                      onClick={() => handleDelete(order.id)}
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
            })}
          </CardList>
        </Column>

        {/* Column 2: Running */}
        <Column style={{ flex: 1.2 }}>
          <ColHeader $color="#2ecc71">
            <ColTitle>Running / In-Progress</ColTitle>
            <CountBadge>{runningOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {runningOrders.map((raw) => {
              const order = mapOrder(raw); // ✅ 수정
              return (
                <ActiveCard
                  key={order.id}
                  $isPaused={order.status === "PAUSED"}
                >
                  <CardTop>
                    <OrderId>{order.woNumber}</OrderId> {/* ✅ 수정 */}
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
                    {order.status === "IN_PROGRESS" ? (
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
              );
            })}
          </CardList>
        </Column>

        {/* Column 3: Completed */}
        <Column>
          <ColHeader $color="#3498db">
            <ColTitle>Completed</ColTitle>
            <CountBadge>{doneOrders.length}</CountBadge>
          </ColHeader>

          <CardList>
            {doneOrders.map((raw) => {
              const order = mapOrder(raw); // ✅ 수정
              return (
                <DoneCard key={order.id}>
                  <CardTop>
                    <OrderId
                      style={{ textDecoration: "line-through", color: "#999" }}
                    >
                      {order.woNumber} {/* ✅ 수정 */}
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
            })}
          </CardList>
        </Column>
      </BoardContainer>
    </Container>
  );
};

export default WorkOrderPage;

/* --- Styled Components (그대로) --- */

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
