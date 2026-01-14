// src/pages/production/ProductionPlanPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckDouble,
  FaList,
} from "react-icons/fa";

// --- Mock Data ---
// 1. 라인 정보
const LINES = [
  { id: "LINE-A", name: "Line-A (HBM Stacking)" },
  { id: "LINE-B", name: "Line-B (Pkg/Reflow)" },
  { id: "LINE-C", name: "Line-C (Test/Module)" },
];

// 2. 날짜 유틸 (현재 주차 날짜 생성)
const getThisWeek = () => {
  const dates = [];
  const today = new Date(); // 실제로는 달력 라이브러리 사용 권장
  // 예시를 위해 고정된 날짜 범위 생성 (5/20 월 ~ 5/26 일)
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 4, 20 + i); // 5월 20일부터
    dates.push({
      full: d.toISOString().split("T")[0],
      day: d.getDate(),
      week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
    });
  }
  return dates;
};

// 3. 생산 계획 데이터
const INITIAL_PLANS = [
  {
    id: "PP-240520-01",
    line: "LINE-A",
    date: "2024-05-20",
    product: "HBM3 8-Hi Stack",
    qty: 500,
    status: "CONFIRMED", // PLANNED, CONFIRMED, RELEASED
    color: "#e3f2fd", // 파랑 배경
    borderColor: "#2196f3",
  },
  {
    id: "PP-240521-02",
    line: "LINE-A",
    date: "2024-05-21",
    product: "HBM3 8-Hi Stack",
    qty: 600,
    status: "RELEASED", // 작업지시 배포 완료
    color: "#e8f5e9", // 초록 배경
    borderColor: "#4caf50",
  },
  {
    id: "PP-240520-03",
    line: "LINE-C",
    date: "2024-05-20",
    product: "DDR5 32GB Module",
    qty: 2000,
    status: "PLANNED",
    color: "#fff3e0", // 주황 배경
    borderColor: "#ff9800",
  },
  {
    id: "PP-240522-04",
    line: "LINE-B",
    date: "2024-05-22",
    product: "HBM3 Package Assy",
    qty: 450,
    status: "PLANNED",
    color: "#fff3e0",
    borderColor: "#ff9800",
  },
];

const ProductionPlanPage = () => {
  const [weekDates, setWeekDates] = useState(getThisWeek());
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // 날짜와 라인에 맞는 계획 찾기
  const getPlanByDateLine = (date, lineId) => {
    return plans.find((p) => p.date === date && p.line === lineId);
  };

  // 계획 선택 핸들러
  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
  };

  // 작업지시 배포 (Plan -> Work Order)
  const handleRelease = () => {
    if (!selectedPlan) return;
    if (selectedPlan.status === "RELEASED")
      return alert("이미 배포된 계획입니다.");

    const updated = plans.map((p) =>
      p.id === selectedPlan.id
        ? { ...p, status: "RELEASED", color: "#e8f5e9", borderColor: "#4caf50" }
        : p
    );
    setPlans(updated);
    setSelectedPlan({ ...selectedPlan, status: "RELEASED" });
    alert(`[${selectedPlan.id}] 계획이 현장으로 배포되었습니다.`);
  };

  return (
    <Container>
      {/* 1. 헤더 및 주간 이동 컨트롤 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaCalendarAlt /> Production Planning
          </PageTitle>
          <SubTitle>주간 생산 일정 수립 및 작업지시 배포</SubTitle>
        </TitleArea>
        <ControlGroup>
          <NavButton>
            <FaChevronLeft />
          </NavButton>
          <DateRange>2024. 05. 20 ~ 2024. 05. 26 (Week 21)</DateRange>
          <NavButton>
            <FaChevronRight />
          </NavButton>
          <AddButton>
            <FaPlus /> New Plan
          </AddButton>
        </ControlGroup>
      </Header>

      {/* 2. 메인 스케줄러 (Matrix View) */}
      <SchedulerContainer>
        {/* 그리드 헤더 (날짜) */}
        <GridHeader>
          <LineHeaderCell>Line / Date</LineHeaderCell>
          {weekDates.map((d) => (
            <DateHeaderCell
              key={d.full}
              $isWeekend={d.week === "Sat" || d.week === "Sun"}
            >
              <DayName>{d.week}</DayName>
              <DayNum>{d.day}</DayNum>
            </DateHeaderCell>
          ))}
        </GridHeader>

        {/* 그리드 바디 (라인별 로우) */}
        <GridBody>
          {LINES.map((line) => (
            <LineRow key={line.id}>
              {/* 라인 이름 */}
              <LineNameCell>{line.name}</LineNameCell>

              {/* 7일치 셀 렌더링 */}
              {weekDates.map((d) => {
                const plan = getPlanByDateLine(d.full, line.id);
                return (
                  <PlanCell key={`${line.id}-${d.full}`}>
                    {plan ? (
                      <PlanBlock
                        $color={plan.color}
                        $borderColor={plan.borderColor}
                        $active={selectedPlan?.id === plan.id}
                        onClick={() => handlePlanClick(plan)}
                      >
                        <ProdName>{plan.product}</ProdName>
                        <ProdQty>{plan.qty.toLocaleString()} ea</ProdQty>
                        <StatusDot $status={plan.status} />
                      </PlanBlock>
                    ) : (
                      <EmptySlot>+</EmptySlot>
                    )}
                  </PlanCell>
                );
              })}
            </LineRow>
          ))}
        </GridBody>
      </SchedulerContainer>

      {/* 3. 하단: 선택된 계획 상세 및 액션 */}
      <DetailPanel>
        <DetailHeader>
          <PanelTitle>
            <FaList /> Plan Detail Information
          </PanelTitle>
          {selectedPlan && (
            <ActionGroup>
              <ActionButton
                onClick={handleRelease}
                disabled={selectedPlan.status === "RELEASED"}
              >
                <FaCheckDouble /> Release to Order (지시 배포)
              </ActionButton>
              <ActionButton>
                <FaEdit /> Edit
              </ActionButton>
              <ActionButton $delete>
                <FaTrash /> Delete
              </ActionButton>
            </ActionGroup>
          )}
        </DetailHeader>

        {selectedPlan ? (
          <DetailContent>
            <InfoGroup>
              <Label>Plan ID</Label>
              <Value>{selectedPlan.id}</Value>
            </InfoGroup>
            <InfoGroup>
              <Label>Target Date</Label>
              <Value>{selectedPlan.date}</Value>
            </InfoGroup>
            <InfoGroup>
              <Label>Product Item</Label>
              <Value style={{ fontWeight: "bold", color: "#1a4f8b" }}>
                {selectedPlan.product}
              </Value>
            </InfoGroup>
            <InfoGroup>
              <Label>Target Quantity</Label>
              <Value>{selectedPlan.qty.toLocaleString()} ea</Value>
            </InfoGroup>
            <InfoGroup>
              <Label>Status</Label>
              <StatusBadge $status={selectedPlan.status}>
                {selectedPlan.status}
              </StatusBadge>
            </InfoGroup>
          </DetailContent>
        ) : (
          <EmptyMessage>
            상단 일정표에서 계획을 선택하여 상세 정보를 확인하세요.
          </EmptyMessage>
        )}
      </DetailPanel>
    </Container>
  );
};

export default ProductionPlanPage;

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

// Header
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  align-items: center;
  gap: 10px;
  background: white;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid #eee;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #555;
  &:hover {
    background: #f5f5f5;
  }
`;

const DateRange = styled.span`
  font-weight: 600;
  font-size: 14px;
  padding: 0 10px;
  color: #333;
`;

const AddButton = styled.button`
  background-color: #1a4f8b;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
  &:hover {
    background-color: #133b6b;
  }
`;

// Scheduler Grid
const SchedulerContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 20px;
`;

const GridHeader = styled.div`
  display: flex;
  height: 60px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
`;

const LineHeaderCell = styled.div`
  width: 180px; /* 라인명 컬럼 고정 너비 */
  padding: 15px;
  font-weight: 700;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
  flex-shrink: 0;
`;

const DateHeaderCell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
  color: ${(props) => (props.$isWeekend ? "#e74c3c" : "#333")};
  background-color: ${(props) =>
    props.$isWeekend ? "#fff5f5" : "transparent"};
`;

const DayName = styled.span`
  font-size: 12px;
  color: #888;
`;

const DayNum = styled.span`
  font-size: 18px;
  font-weight: 700;
`;

const GridBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const LineRow = styled.div`
  display: flex;
  height: 100px; /* 로우 높이 */
  border-bottom: 1px solid #eee;
`;

const LineNameCell = styled.div`
  width: 180px;
  padding: 15px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  border-right: 1px solid #eee;
  background-color: #fff;
  flex-shrink: 0;
  font-size: 14px;
`;

const PlanCell = styled.div`
  flex: 1;
  border-right: 1px solid #eee;
  padding: 5px;
  position: relative;

  &:hover {
    background-color: #fafafa;
  }
`;

// Empty Slot (+ button)
const EmptySlot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;

  ${PlanCell}:hover & {
    color: #ddd;
    border: 2px dashed #eee;
  }

  &:hover {
    color: #1a4f8b !important;
    border-color: #1a4f8b !important;
    background-color: #e3f2fd;
  }
`;

// Plan Block Card
const PlanBlock = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.$color};
  border-left: 4px solid ${(props) => props.$borderColor};
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: ${(props) => (props.$active ? "0 0 0 2px #1a4f8b" : "none")};
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ProdName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProdQty = styled.div`
  font-size: 12px;
  color: #555;
`;

const StatusDot = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$status === "RELEASED"
      ? "#2ecc71"
      : props.$status === "CONFIRMED"
      ? "#2196f3"
      : "#ff9800"};
`;

// Detail Panel (Bottom)
const DetailPanel = styled.div`
  height: 160px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const PanelTitle = styled.h3`
  font-size: 16px;
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailContent = styled.div`
  display: flex;
  gap: 40px;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #888;
`;

const Value = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "RELEASED"
      ? "#e8f5e9"
      : props.$status === "CONFIRMED"
      ? "#e3f2fd"
      : "#fff3e0"};
  color: ${(props) =>
    props.$status === "RELEASED"
      ? "#2e7d32"
      : props.$status === "CONFIRMED"
      ? "#1976d2"
      : "#ef6c00"};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: ${(props) => (props.$delete ? "#e74c3c" : "#333")};

  &:hover {
    background: #f5f5f5;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.div`
  color: #aaa;
  font-size: 14px;
  display: flex;
  align-items: center;
  height: 100%;
`;
