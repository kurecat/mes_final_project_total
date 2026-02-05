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

// 2. Item List Item Component
const ItemListItem = React.memo(({ item, isActive, onClick }) => {
  return (
    <ItemCard $active={isActive} onClick={() => onClick(item)}>
      <CardTop>
        <SerialNumber>{item.serialNumber}</SerialNumber>
        <StatusBadge $status={item.inspectionResult}>
          {item.inspectionResult}
        </StatusBadge>
      </CardTop>
      <ProductCode>{item.productCode}</ProductCode>
    </ItemCard>
  );
});

// 3. List Panel Component
const ItemListPanel = React.memo(
  ({ searchTerm, onSearchChange, items, selectedItem, onItemClick }) => {
    return (
      <ListPanel>
        <SearchArea>
          <FaSearch color="#999" />
          <SearchInput
            placeholder="Search Item ID or Product..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchArea>

        <ItemList>
          {items.map((item) => (
            <ItemListItem
              key={item.id}
              item={item}
              isActive={selectedItem === item.id}
              onClick={onItemClick}
            />
          ))}
        </ItemList>
      </ListPanel>
    );
  },
);

// 4. Detail View Component
const DetailView = React.memo(({ productionLog }) => {
  if (!productionLog) {
    return (
      <DetailPanel>
        <EmptyState>Select a Production Log to view details</EmptyState>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel>
      <DetailHeader>
        <TitleGroup>
          <FaBoxOpen size={24} color="#555" />
          <h2>Production Log #{productionLog.id}</h2>
        </TitleGroup>
        <MetaGroup>
          <MetaTag $type="status">{productionLog.status}</MetaTag>
          <MetaTag $type="qty">{productionLog.resultQty} Produced</MetaTag>
          <MetaTag $type="defect">{productionLog.defectQty} Defects</MetaTag>
        </MetaGroup>
      </DetailHeader>

      <InfoGrid>
        <InfoItem>
          <Label>Work Order</Label>
          <Value>{productionLog.workOrderNumber}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Worker</Label>
          <Value>{productionLog.workerCode}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Equipment</Label>
          <Value>{productionLog.equipmentCode}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Start Time</Label>
          <Value>{productionLog.startTime}</Value>
        </InfoItem>
        <InfoItem>
          <Label>End Time</Label>
          <Value>{productionLog.endTime}</Value>
        </InfoItem>
      </InfoGrid>

      {/* --- 공정 정보 --- */}
      <ProcessSection>
        <h3>Process Details</h3>

        {/* 1. Dicing */}
        {productionLog.dicingDto && (
          <>
            <h4>Dicing</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Spindle Speed</Label>
                <Value>{productionLog.dicingDto.spindleSpeed}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Feed Rate</Label>
                <Value>{productionLog.dicingDto.feedRate}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Blade Wear</Label>
                <Value>{productionLog.dicingDto.bladeWear}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Coolant Flow</Label>
                <Value>{productionLog.dicingDto.coolantFlow}</Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 2. Dicing Inspection */}
        {productionLog.dicingInspectionDto && (
          <>
            <h4>Dicing Inspection</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Sample Size</Label>
                <Value>{productionLog.dicingInspectionDto.sampleSize}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Criteria</Label>
                <Value>
                  {productionLog.dicingInspectionDto.inspectionCriteria}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Thickness Pass %</Label>
                <Value>
                  {productionLog.dicingInspectionDto.thicknessPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Chipping Pass %</Label>
                <Value>
                  {productionLog.dicingInspectionDto.chippingPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Overall Pass %</Label>
                <Value>
                  {productionLog.dicingInspectionDto.overallPassRatio}
                </Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 3. Die Bonding */}
        {productionLog.dieBondingDto && (
          <>
            <h4>Die Bonding</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Pick Up Force</Label>
                <Value>{productionLog.dieBondingDto.pickUpForce}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Placement Accuracy</Label>
                <Value>{productionLog.dieBondingDto.placementAccuracy}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Epoxy Volume</Label>
                <Value>{productionLog.dieBondingDto.epoxyDispenseVolume}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Curing Temp</Label>
                <Value>{productionLog.dieBondingDto.curingTemp}</Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 4. Die Bonding Inspection */}
        {productionLog.dieBondingInspectionDto && (
          <>
            <h4>Die Bonding Inspection</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Sample Size</Label>
                <Value>
                  {productionLog.dieBondingInspectionDto.sampleSize}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Criteria</Label>
                <Value>
                  {productionLog.dieBondingInspectionDto.inspectionCriteria}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Alignment Pass %</Label>
                <Value>
                  {productionLog.dieBondingInspectionDto.alignmentPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Void Pass %</Label>
                <Value>
                  {productionLog.dieBondingInspectionDto.voidPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Overall Pass %</Label>
                <Value>
                  {productionLog.dieBondingInspectionDto.overallPassRatio}
                </Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 5. Wire Bonding */}
        {productionLog.wireBondingDto && (
          <>
            <h4>Wire Bonding</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Bonding Temp</Label>
                <Value>{productionLog.wireBondingDto.bondingTemp}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Bonding Force</Label>
                <Value>{productionLog.wireBondingDto.bondingForce}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Ultrasonic Power</Label>
                <Value>{productionLog.wireBondingDto.ultrasonicPower}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Bonding Time</Label>
                <Value>{productionLog.wireBondingDto.bondingTime}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Loop Height</Label>
                <Value>{productionLog.wireBondingDto.loopHeight}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Ball Diameter</Label>
                <Value>{productionLog.wireBondingDto.ballDiameter}</Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 6. Wire Bonding Inspection */}
        {productionLog.wireBondingInspectionDto && (
          <>
            <h4>Wire Bonding Inspection</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Sample Size</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.sampleSize}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Criteria</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.inspectionCriteria}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Pull Test %</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.pullTestPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Shear Test %</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.shearTestPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>X-Ray %</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.xrayPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Overall Pass %</Label>
                <Value>
                  {productionLog.wireBondingInspectionDto.overallPassRatio}
                </Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 7. Molding */}
        {productionLog.moldingDto && (
          <>
            <h4>Molding</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Mold Temp</Label>
                <Value>{productionLog.moldingDto.moldTemp}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Injection Pressure</Label>
                <Value>{productionLog.moldingDto.injectionPressure}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Cure Time</Label>
                <Value>{productionLog.moldingDto.cureTime}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Clamp Force</Label>
                <Value>{productionLog.moldingDto.clampForce}</Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}

        {/* 8. Molding Inspection */}
        {productionLog.moldingInspectionDto && (
          <>
            <h4>Molding Inspection</h4>
            <InfoGrid>
              <InfoItem>
                <Label>Sample Size</Label>
                <Value>{productionLog.moldingInspectionDto.sampleSize}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Criteria</Label>
                <Value>
                  {productionLog.moldingInspectionDto.inspectionCriteria}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Thickness Pass %</Label>
                <Value>
                  {productionLog.moldingInspectionDto.thicknessPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Void Pass %</Label>
                <Value>
                  {productionLog.moldingInspectionDto.voidPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Crack Pass %</Label>
                <Value>
                  {productionLog.moldingInspectionDto.crackPassRatio}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Overall Pass %</Label>
                <Value>
                  {productionLog.moldingInspectionDto.overallPassRatio}
                </Value>
              </InfoItem>
            </InfoGrid>
          </>
        )}
      </ProcessSection>

      {/* --- LOT 리스트 --- */}
      <ProcessSection>
        <h3>Input Lots</h3>
        <RouteContainer>
          {productionLog.inputLots &&
            productionLog.inputLots.map((lot, idx) => (
              <StepItem key={lot} $status="DONE">
                {/* 번호 대신 그냥 아이콘만 표시 */}
                <StepCircle $status="DONE">✔</StepCircle>
                <StepText>
                  <StepName>{lot.code}</StepName>
                  <StepStatus $status="DONE">{lot.materialCode}</StepStatus>
                </StepText>
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
  const [productionLog, setProductionLog] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm) return;
    const fetchItems = async () => {
      try {
        // 1. 백엔드 API 호출 (Lot 목록)
        const response = await axiosInstance.get(
          `/api/mes/item/search?serialNumber=${searchTerm}`,
        );

        setItems(response.data);

        // 첫 번째 항목 자동 선택 (선택 시 이력 조회 트리거)
        if (response.data.length > 0) {
          // 주의: 여기서 바로 handleItemClick을 부르거나,
          // setSelectedItem만 하고 별도로 로딩해야 함.
          // 간단하게 첫번째는 정보만 보여줍니다.
          setSelectedItem(response.data[0]);
        }
      } catch (error) {
        console.error("Item 목록 조회 실패:", error);
      }
    };

    fetchItems();
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedItem) return;
    const fetchProductionLog = async () => {
      console.log("selectedItem", selectedItem);

      try {
        const response = await axiosInstance.get(
          `/api/mes/production-log/${selectedItem.productionLogId}`,
        );
        console.log(response.data);
        setProductionLog(response.data);
      } catch (error) {
        console.error("ProductionLog 조회 실패:", error);
      }
    };

    fetchProductionLog();
  }, [selectedItem]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  return (
    <Container>
      {/* 1. Header (추가됨) */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaMicrochip /> Lot Tracking
          </PageTitle>
          <SubTitle>Serial Number & Log Tracking </SubTitle>
        </TitleArea>
      </Header>

      {/* 2. Stats Section */}
      {/* <LotTrackingHeader stats={stats} /> */}

      {/* 3. Main Content */}
      <MainContent>
        <ItemListPanel
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          items={items}
          selectedItem={selectedItem}
          onItemClick={handleItemClick}
        />
        <DetailView productionLog={productionLog} />
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

const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #fcfcfc;
`;

const ItemCard = styled.div`
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

const SerialNumber = styled.span`
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

const ProductCode = styled.div`
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
  margin-top: 20px;
  margin-bottom: 40px;
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
