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
    issue:
      order.status === "PAUSED"
        ? order.shortageMaterialName
          ? `${order.shortageMaterialName} 자재 부족`
          : "작업 중단됨"
        : "",
    shortageMaterialName: order.shortageMaterialName,
    shortageQty: order.shortageQty,
  };
};

/* =========================
   Sub Components
========================= */
const ControlHeader = React.memo(
  ({ loading, lineFilter, onFilterChange, searchTerm, onSearchChange }) => (
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
            <option value="Line-A">Line-A</option>
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
  ),
);

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

const KanbanColumn = React.memo(
  ({ title, color, orders, type, onStatusUpdate, onDelete }) => (
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
  ),
);

/* =========================
   Main Page
========================= */
const WorkOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lineFilter, setLineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 중단 사유 모달 State
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseTargetId, setPauseTargetId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(""); // 체크박스 선택값
  const [etcReason, setEtcReason] = useState(""); // 기타 입력값

  // 자재 부족 알림 모달 State
  const [inventoryModal, setInventoryModal] = useState({
    isOpen: false,
    materialName: "",
    shortageQty: 0,
    handledShortageId: null, // 사용자가 이미 닫기 버튼을 누른 작업 ID 저장
  });

  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/mes/order`);
        const data = res.data;
        setOrders(data);

        // 자동 모달 체크 로직
        // 조건: 상태가 PAUSED이고, 자재부족 정보가 있으며, 현재 사용자가 '닫기'를 누른 ID가 아닐 것
        const shortageOrder = data.find(
          (o) =>
            o.status === "PAUSED" &&
            o.shortageMaterialName &&
            o.id !== inventoryModal.handledShortageId,
        );

        if (shortageOrder && !inventoryModal.isOpen) {
          setInventoryModal((prev) => ({
            ...prev,
            isOpen: true,
            materialName: shortageOrder.shortageMaterialName,
            shortageQty: shortageOrder.shortageQty,
            // 새로운 자재 부족 건이 발견되면 handledId는 초기화
          }));
        }
      } catch (error) {
        console.error("데이터 갱신 실패:", error);
      } finally {
        setLoading(false);
      }
    },
    [inventoryModal.isOpen, inventoryModal.handledShortageId],
  );

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // 중단 사유
  const REASON_OPTIONS = [
    "불량 - 재고 퀄리티 미달",
    "이상 - 설비 불량 및 고장",
    "이상 - 생산정보 오류",
    "기타",
  ];
  // 자재 부족 모달 닫기 함수
  const closeInventoryModal = () => {
    // 현재 부족 현상이 있는 작업의 ID를 handledShortageId에 등록하여 다음 폴링 때 안 뜨게 함
    const targetOrder = orders.find(
      (o) => o.status === "PAUSED" && o.shortageMaterialName,
    );
    setInventoryModal((prev) => ({
      ...prev,
      isOpen: false,
      handledShortageId: targetOrder ? targetOrder.id : prev.handledShortageId,
    }));
  };

  const updateStatus = useCallback(
    async (id, nextStatus) => {
      // 🔥 [수정] Pause 버튼 클릭 시 즉시 PAUSED 상태로 변경 처리
      if (nextStatus === "PAUSE_REQUEST") {
        try {
          // 1. 서버에 즉시 PAUSED 상태 전송
          await axiosInstance.patch(`/api/mes/order/${id}/status`, {
            status: "PAUSED",
          });

          // 2. 이벤트 로그 기록 (사유 없음 버전)
          await axiosInstance.post(`/api/mes/production-log/event`, {
            workOrderId: id,
            actionType: "PAUSE",
          });

          // 3. UI 갱신 및 모달 띄우기
          setPauseTargetId(id);
          setPauseReason("");
          setPauseModalOpen(true);
          fetchData(true); // 상태 변경 확인을 위해 silent fetch
          return;
        } catch (e) {
          alert("일시정지 처리 중 오류가 발생했습니다.");
          return;
        }
      }

      // 기존 IN_PROGRESS, COMPLETED 로직은 유지
      try {
        await axiosInstance.patch(`/api/mes/order/${id}/status`, {
          status: nextStatus,
        });

        let actionType = "START";
        if (nextStatus === "COMPLETED") actionType = "FINISH";

        await axiosInstance.post(`/api/mes/production-log/event`, {
          workOrderId: id,
          actionType,
        });

        if (nextStatus === "IN_PROGRESS" || nextStatus === "COMPLETED") {
          setInventoryModal((prev) => ({ ...prev, handledShortageId: null }));
        }

        fetchData();
      } catch (e) {
        const errorData = e.response?.data;
        if (
          errorData?.type === "INVENTORY_SHORTAGE" ||
          errorData?.message?.includes("재고가 부족")
        ) {
          setInventoryModal({
            isOpen: true,
            materialName: errorData.materialName || "특정 자재",
            shortageQty: errorData.shortageQty || 0,
            handledShortageId: null,
          });
        } else {
          alert(errorData?.message || "처리에 실패했습니다.");
        }
      }
    },
    [fetchData],
  );

  // 🔥 [수정] 사유 저장 함수 - 이미 상태는 PAUSED이므로 사유 업데이트(로그)만 수행
  const savePauseReason = async () => {
    // 실제 저장될 최종 메시지 결정
    const finalReason = selectedReason === "기타" ? etcReason : selectedReason;

    if (!finalReason.trim())
      return alert("중단 사유를 선택하거나 입력해주세요.");

    try {
      await axiosInstance.post(`/api/mes/production-log/event`, {
        workOrderId: pauseTargetId,
        actionType: "PAUSE",
        message: finalReason, // 합쳐진 사유 전달
      });

      setPauseModalOpen(false);
      setPauseTargetId(null);
      setSelectedReason("");
      setEtcReason("");
      fetchData();
    } catch (e) {
      alert("사유 저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await axiosInstance.delete(`/api/mes/order/${id}`);
    fetchData();
  };

  const filteredOrders = useMemo(() => {
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
          orders={filteredOrders.readyOrders}
          type="ready"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
        <KanbanColumn
          title="Running"
          color="#2ecc71"
          orders={filteredOrders.runningOrders}
          type="running"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
        <KanbanColumn
          title="Completed"
          color="#3498db"
          orders={filteredOrders.doneOrders}
          type="done"
          onStatusUpdate={updateStatus}
          onDelete={handleDelete}
        />
      </BoardContainer>

      {/* 중단 사유 모달 */}
      {pauseModalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h3>
              <FaPause /> 작업 중단 사유 선택
            </h3>
            <ReasonList>
              {REASON_OPTIONS.map((option) => (
                <ReasonItem
                  key={option}
                  onClick={() => setSelectedReason(option)}
                >
                  <input
                    type="radio" // 하나만 선택하므로 radio가 적합합니다
                    checked={selectedReason === option}
                    onChange={() => setSelectedReason(option)}
                  />
                  <span>{option}</span>
                </ReasonItem>
              ))}
            </ReasonList>

            {/* '기타' 선택 시에만 입력창 활성화 */}
            {selectedReason === "기타" && (
              <textarea
                value={etcReason}
                onChange={(e) => setEtcReason(e.target.value)}
                placeholder="기타 사유를 상세히 입력하세요"
                style={{ marginTop: "10px", height: "80px" }}
              />
            )}

            <ModalActions>
              <ModalBtn
                $cancel
                onClick={() => {
                  setPauseModalOpen(false);
                  setSelectedReason("");
                  setEtcReason("");
                }}
              >
                Cancel
              </ModalBtn>
              <ModalBtn onClick={savePauseReason}>Save</ModalBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 자재 부족 알림 모달 */}
      {inventoryModal.isOpen && (
        <ModalOverlay>
          <ModalBox style={{ borderTop: "5px solid #e74c3c" }}>
            <h3
              style={{
                color: "#e74c3c",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaExclamationCircle /> 자재 부족 알림
            </h3>
            <div
              style={{ padding: "10px 0", lineHeight: "1.6", fontSize: "14px" }}
            >
              현재 <strong>{inventoryModal.materialName}</strong>의 재고가
              <br />
              <strong style={{ color: "#e74c3c", fontSize: "18px" }}>
                {inventoryModal.shortageQty}개
              </strong>{" "}
              부족합니다. <br />
              재고를 보충해 주세요.
            </div>
            <ModalActions>
              <ModalBtn
                onClick={closeInventoryModal}
                style={{
                  background: "#34495e",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                확인 및 닫기
              </ModalBtn>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default WorkOrderPage;

/* =========================
   Styles (기존 유지)
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
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
  select {
    border: none;
    padding: 8px;
    outline: none;
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
  max-height: 100%;
`;
const ColHeader = styled.div`
  padding: 15px;
  background: white;
  border-top: 4px solid ${(p) => p.$color};
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ColTitle = styled.h3`
  margin: 0;
  font-size: 16px;
`;
const CountBadge = styled.span`
  background: #eee;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  align-items: center;
`;
const OrderId = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #555;
`;
const ProdName = styled.div`
  font-weight: 700;
  font-size: 15px;
`;
const LineInfo = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
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
  background: ${(p) => (p.$status === "PAUSED" ? "#f39c12" : "#2ecc71")};
  color: white;
`;
const ProgressWrapper = styled.div`
  margin: 10px 0;
`;
const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
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
  width: ${(p) => p.$percent}%;
  height: 100%;
  background: ${(p) => (p.$paused ? "#f39c12" : "#2ecc71")};
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
  gap: 8px;
  margin-top: 5px;
`;
const ActionButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${(p) =>
    p.$type === "start" || p.$type === "resume"
      ? "#2ecc71"
      : p.$type === "pause"
        ? "#f39c12"
        : p.$type === "finish"
          ? "#3498db"
          : "#e74c3c"};
  &:hover {
    opacity: 0.9;
  }
`;
const PrintButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #f9f9f9;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalBox = styled.div`
  width: 380px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
  }
  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
    resize: none;
  }
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const ModalBtn = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: 600;
  background: ${(p) => (p.$cancel ? "#95a5a6" : "#f39c12")};
  &:hover {
    opacity: 0.9;
  }
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  span {
    font-size: 14px;
    color: #333;
  }
`;
