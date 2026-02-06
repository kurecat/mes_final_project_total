// src/pages/production/LotTrackingPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaIndustry,
  FaPauseCircle,
  FaPlayCircle,
  FaClock,
  FaMicrochip,
  FaExclamationTriangle,
  FaArrowRight,
  FaBoxOpen,
} from "react-icons/fa";

import axiosInstance from "../../../api/axios";

// --- Helpers ---
const getStatusColor = (status) => {
  switch (status) {
    case "RUNNING":
      return "#2ecc71"; // Green
    case "HOLD":
      return "#e74c3c"; // Red
    case "WAIT":
      return "#f39c12"; // Orange
    default:
      return "#95a5a6";
  }
};

const getProgressColor = (percent) => {
  if (percent < 30) return "#f1c40f";
  if (percent < 70) return "#3498db";
  return "#2ecc71";
};

// --- Sub-Components ---

// 1. Header Stats Component

// 2. Lot List Item Component
const LotListItem = React.memo(({ item, isActive, onClick }) => {
  return (
    <LotCard $active={isActive} onClick={() => onClick(item)}>
      <CardTop>
        <LotId>{item.id}</LotId>
        <StatusBadge $status={item.status}>{item.status}</StatusBadge>
      </CardTop>
      <ProductName>{item.product}</ProductName>
      <StepInfo>
        Current: <b>{item.currentStep}</b>
      </StepInfo>
      <ProgressBarContainer>
        <ProgressBar
          $width={item.progress}
          $color={getProgressColor(item.progress)}
        />
      </ProgressBarContainer>
      <ProgressLabel>{item.progress}% Complete</ProgressLabel>
    </LotCard>
  );
});

// 3. List Panel Component
const ItemListPanel = React.memo(
  ({ searchTerm, onSearchChange, filteredItems, selectedItem, onLotClick }) => {
    return (
      <ListPanel>
        <SearchArea>
          <FaSearch color="#999" />
          <SearchInput
            placeholder="Search Lot ID or Product..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchArea>

        <LotList>
          {filteredItems.map((item) => (
            <LotListItem
              key={item.id}
              item={item}
              isActive={selectedItem === item.id}
              onClick={onLotClick}
            />
          ))}
        </LotList>
      </ListPanel>
    );
  },
);

// 4. Detail View Component
const DetailView = React.memo(({ selectedLot }) => {
  if (!selectedLot) {
    return (
      <DetailPanel>
        <EmptyState>Select a Lot to view details</EmptyState>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel>
      <DetailHeader>
        <TitleGroup>
          <FaBoxOpen size={24} color="#555" />
          <h2>{selectedLot.id} Details</h2>
        </TitleGroup>
        <MetaGroup>
          <MetaTag $type="priority">{selectedLot.priority} Priority</MetaTag>
          <MetaTag $type="qty">{selectedLot.waferQty} Wafers</MetaTag>
        </MetaGroup>
      </DetailHeader>

      <InfoGrid>
        <InfoItem>
          <Label>Product ID</Label>
          <Value>{selectedLot.product}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Equipment</Label>
          <Value>{selectedLot.equipmentId}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Start Time</Label>
          <Value>{selectedLot.startTime}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Est. Completion</Label>
          <Value>{selectedLot.eta}</Value>
        </InfoItem>
      </InfoGrid>

      {selectedLot.status === "HOLD" && (
        <AlertBox>
          <FaExclamationTriangle />
          <span>
            <b>HOLD REASON:</b> {selectedLot.holdReason}
          </span>
        </AlertBox>
      )}

      <ProcessSection>
        <h3>Process Route Tracking</h3>
        <RouteContainer>
          {selectedLot.route &&
            selectedLot.route.map((step, idx) => (
              <StepItem key={idx} $status={step.status}>
                <StepCircle $status={step.status}>{idx + 1}</StepCircle>
                <StepText>
                  <StepName>{step.step}</StepName>
                  <StepStatus $status={step.status}>{step.status}</StepStatus>
                </StepText>
                {idx !== selectedLot.route.length - 1 && <Line />}
              </StepItem>
            ))}
        </RouteContainer>
      </ProcessSection>
    </DetailPanel>
  );
});

// --- Main Component ---

const LotTrackingPage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // 1. 백엔드 API 호출 (Lot 목록)
        const response = await axiosInstance.get("/api/mes/item/list");
        const rawData = response.data || [];

        // 2. 데이터 가공 (LotResDto -> 화면 포맷)
        const formattedItems = rawData.map((item) => ({
          id: item.id, // DB PK (나중에 클릭 시 사용)
          itemCode: item.itemCode, // 화면 표시용 번호 (LOT-2024...)
          product: item.materialName, // 자재명
          status: item.status, // 상태 (IN_USE 등)
          currentStep: item.location || "Unknown", // 위치
          progress: item.currentQty > 0 ? 100 : 0, // (임시) 잔량 있으면 100%
          waferQty: item.currentQty, // 수량
          startTime: "-", // 리스트엔 없음
          eta: "-",
          route: [], // 상세 이력은 클릭해야 가져옴 (Lazy Loading)
        }));

        setItems(formattedItems);

        // 첫 번째 항목 자동 선택 (선택 시 이력 조회 트리거)
        if (formattedItems.length > 0) {
          // 주의: 여기서 바로 handleItemClick을 부르거나,
          // setSelectedItem만 하고 별도로 로딩해야 함.
          // 간단하게 첫번째는 정보만 보여줍니다.
          setSelectedItem(formattedItems[0]);
        }
      } catch (error) {
        console.error("Lot 목록 조회 실패:", error);
      }
    };

    fetchItems();
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  // Search Filter Logic (Safe version)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const term = searchTerm.toLowerCase();

      // 1. Search by Lot Code (String) - e.g., "LOT-2026-A001"
      // Use optional chaining (?.) or logical OR (||) to prevent errors if data is missing
      const codeMatch = item.itemCode
        ? item.itemCode.toLowerCase().includes(term)
        : false;

      // 2. Search by Product Name (String)
      const productMatch = item.product
        ? item.product.toLowerCase().includes(term)
        : false;

      // 3. (Optional) Search by Numeric ID - Convert to String first
      const idMatch = String(item.id).includes(term);

      return codeMatch || productMatch || idMatch;
    });
  }, [items, searchTerm]);

  return (
    <Container>
      {/* 1. Header (추가됨) */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaMicrochip /> Lot Tracking
          </PageTitle>
          <SubTitle>Log Tracking & History</SubTitle>
        </TitleArea>
      </Header>

      {/* 2. Stats Section */}
      {/* <LotTrackingHeader stats={stats} /> */}

      {/* 3. Main Content */}
      <MainContent>
        <ItemListPanel
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filteredItems={filteredItems}
          selectedItem={selectedItem}
          onLotClick={handleItemClick}
        />
        <DetailView productionLogId={selectedItem.productionLogId} />
      </MainContent>
    </Container>
  );
};

export default LotTrackingPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
`;

// ★ Header Styles Added
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
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const StatItem = styled.div`
  flex: 1;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatIcon = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #888;
`;

const MainContent = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  margin-bottom: 70px;
`;

const ListPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 400px;
`;

const SearchArea = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  background: #fff;
`;

const SearchInput = styled.input`
  border: none;
  margin-left: 10px;
  font-size: 14px;
  width: 100%;
  outline: none;
  &::placeholder {
    color: #ccc;
  }
`;

const LotList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #fcfcfc;
`;

const LotCard = styled.div`
  background: ${(props) => (props.$active ? "#eef2f7" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#3498db" : "#eee")};
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const LotId = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "RUNNING"
      ? "#e8f5e9"
      : props.$status === "HOLD"
        ? "#ffebee"
        : "#fff3e0"};
  color: ${(props) =>
    props.$status === "RUNNING"
      ? "#2ecc71"
      : props.$status === "HOLD"
        ? "#e74c3c"
        : "#f39c12"};
`;

const ProductName = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const StepInfo = styled.div`
  font-size: 12px;
  color: #444;
  margin-bottom: 8px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-bottom: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  width: ${(props) => props.$width}%;
  height: 100%;
  background-color: ${(props) => props.$color};
`;

const ProgressLabel = styled.div`
  font-size: 10px;
  color: #999;
  text-align: right;
`;

const DetailPanel = styled.div`
  flex: 2;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f5f5f5;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h2 {
    margin: 0;
    font-size: 22px;
    color: #333;
  }
`;

const MetaGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const MetaTag = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  background: ${(props) =>
    props.$type === "priority" ? "#e3f2fd" : "#f5f5f5"};
  color: ${(props) => (props.$type === "priority" ? "#1565c0" : "#555")};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
`;

const Value = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const AlertBox = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 14px;
`;

const ProcessSection = styled.div`
  margin-top: 10px;
  h3 {
    font-size: 16px;
    color: #333;
    margin-bottom: 20px;
  }
`;

const RouteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-bottom: 30px;
  opacity: ${(props) => (props.$status === "WAIT" ? 0.4 : 1)};
`;

const StepCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) =>
    props.$status === "DONE"
      ? "#2ecc71"
      : props.$status === "RUNNING"
        ? "#3498db"
        : props.$status === "HOLD"
          ? "#e74c3c"
          : "#ddd"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
  margin-right: 15px;
`;

const Line = styled.div`
  position: absolute;
  top: 24px;
  left: 11px;
  width: 2px;
  height: calc(100% - 24px);
  background: #eee;
  z-index: 1;
`;

const StepText = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const StepStatus = styled.span`
  font-size: 11px;
  margin-top: 2px;
  color: ${(props) => (props.$status === "RUNNING" ? "#3498db" : "#888")};
  font-weight: ${(props) => (props.$status === "RUNNING" ? "bold" : "normal")};
`;

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 18px;
`;
