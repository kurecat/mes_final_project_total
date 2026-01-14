// src/pages/mdm/LocationPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaWarehouse,
  FaMapMarkerAlt,
  FaBoxes,
  FaPlus,
  FaSearch,
  FaArrowRight,
  FaLayerGroup,
  FaTh,
} from "react-icons/fa";

// --- Mock Data (창고 및 Bin 구조) ---
// 구조: Warehouse (창고) -> Zone (구역) -> Bin (선반/셀)
const WAREHOUSE_DATA = [
  {
    id: "WH-RM-01",
    name: "Raw Material Warehouse A",
    type: "Warehouse",
    manager: "Manager Kim",
    occupancy: 75, // 전체 점유율
    zones: [
      {
        id: "ZONE-A",
        name: "Wafer Storage (Temp Controlled)",
        type: "Rack",
        totalBins: 20,
        // Bin 데이터 (Grid 시각화용)
        bins: Array.from({ length: 20 }, (_, i) => ({
          code: `A-${String(i + 1).padStart(2, "0")}`,
          status: i < 5 ? "FULL" : i < 15 ? "PARTIAL" : "EMPTY", // 가상 상태
          item: i < 5 ? "12-inch Si Wafer" : i < 15 ? "Glass Substrate" : null,
          qty: i < 5 ? 100 : i < 15 ? 45 : 0,
          maxQty: 100,
        })),
      },
      {
        id: "ZONE-B",
        name: "Chemical Cabinet",
        type: "Cabinet",
        totalBins: 12,
        bins: Array.from({ length: 12 }, (_, i) => ({
          code: `B-${String(i + 1).padStart(2, "0")}`,
          status: i % 2 === 0 ? "FULL" : "EMPTY",
          item: i % 2 === 0 ? "NCP Epoxy" : null,
          qty: i % 2 === 0 ? 50 : 0,
          maxQty: 50,
        })),
      },
    ],
  },
  {
    id: "WH-FG-02",
    name: "Finished Goods Warehouse",
    type: "Warehouse",
    manager: "Manager Lee",
    occupancy: 40,
    zones: [
      {
        id: "ZONE-S",
        name: "Shipping Area",
        type: "Floor",
        totalBins: 15,
        bins: Array.from({ length: 15 }, (_, i) => ({
          code: `S-${String(i + 1).padStart(2, "0")}`,
          status: i < 3 ? "FULL" : "EMPTY",
          item: i < 3 ? "HBM3 Module Box" : null,
          qty: i < 3 ? 500 : 0,
          maxQty: 500,
        })),
      },
    ],
  },
];

const LocationPage = () => {
  const [selectedZone, setSelectedZone] = useState(WAREHOUSE_DATA[0].zones[0]);
  const [selectedBin, setSelectedBin] = useState(null);

  // 점유율 색상 계산
  const getOccupancyColor = (percent) => {
    if (percent >= 90) return "#e74c3c"; // Red (Full)
    if (percent >= 50) return "#f39c12"; // Orange (Half)
    return "#2ecc71"; // Green (Good)
  };

  // Bin 상태에 따른 색상
  const getBinColor = (status) => {
    switch (status) {
      case "FULL":
        return "#ff6b6b"; // Red
      case "PARTIAL":
        return "#feca57"; // Yellow
      case "EMPTY":
        return "#e2e6ea"; // Gray
      default:
        return "#e2e6ea";
    }
  };

  return (
    <Container>
      {/* 1. 좌측 사이드바: 창고 및 구역 목록 */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaWarehouse /> Location List
          </Title>
          <AddButton>
            <FaPlus /> New Warehouse
          </AddButton>
        </SidebarHeader>

        <TreeList>
          {WAREHOUSE_DATA.map((wh) => (
            <WarehouseGroup key={wh.id}>
              <WarehouseItem>
                <WhIcon>
                  <FaWarehouse />
                </WhIcon>
                <WhInfo>
                  <WhName>{wh.name}</WhName>
                  <WhMeta>
                    Occ:{" "}
                    <span
                      style={{
                        color: getOccupancyColor(wh.occupancy),
                        fontWeight: "bold",
                      }}
                    >
                      {wh.occupancy}%
                    </span>
                  </WhMeta>
                </WhInfo>
              </WarehouseItem>

              <ZoneList>
                {wh.zones.map((zone) => (
                  <ZoneItem
                    key={zone.id}
                    $active={selectedZone.id === zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      setSelectedBin(null); // 구역 변경 시 선택된 Bin 초기화
                    }}
                  >
                    <FaLayerGroup size={12} /> {zone.name}
                  </ZoneItem>
                ))}
              </ZoneList>
            </WarehouseGroup>
          ))}
        </TreeList>
      </Sidebar>

      {/* 2. 우측 컨텐츠: 구역 상세 및 시각화 */}
      <ContentArea>
        {selectedZone && (
          <>
            <HeaderSection>
              <HeaderTitle>
                <FaMapMarkerAlt /> {selectedZone.name}
                <TypeBadge>{selectedZone.type}</TypeBadge>
              </HeaderTitle>
              <MetaInfo>
                Code: <strong>{selectedZone.id}</strong> | Total Bins:{" "}
                {selectedZone.totalBins}
              </MetaInfo>
            </HeaderSection>

            <VisualSection>
              {/* A. Bin 배치도 (Grid Map) */}
              <MapContainer>
                <SectionTitle>
                  <FaTh /> Bin Layout Map
                </SectionTitle>
                <GridMap>
                  {selectedZone.bins.map((bin) => (
                    <BinBox
                      key={bin.code}
                      $status={bin.status}
                      $active={selectedBin?.code === bin.code}
                      onClick={() => setSelectedBin(bin)}
                      title={`${bin.code}: ${bin.status}`}
                    >
                      <BinCode>{bin.code}</BinCode>
                      {bin.status !== "EMPTY" && (
                        <FaBoxes size={14} style={{ opacity: 0.5 }} />
                      )}
                    </BinBox>
                  ))}
                </GridMap>
                <Legend>
                  <LegendItem>
                    <Dot color="#ff6b6b" /> Full
                  </LegendItem>
                  <LegendItem>
                    <Dot color="#feca57" /> Partial
                  </LegendItem>
                  <LegendItem>
                    <Dot color="#e2e6ea" /> Empty
                  </LegendItem>
                </Legend>
              </MapContainer>

              {/* B. 선택된 Bin 상세 정보 */}
              <DetailPanel>
                <SectionTitle>Selected Bin Detail</SectionTitle>
                {selectedBin ? (
                  <BinDetailCard>
                    <DetailHeader>
                      <BinBigCode>{selectedBin.code}</BinBigCode>
                      <StatusBadge $status={selectedBin.status}>
                        {selectedBin.status}
                      </StatusBadge>
                    </DetailHeader>

                    <DetailRow>
                      <Label>Item Name</Label>
                      <Value>{selectedBin.item || "-"}</Value>
                    </DetailRow>

                    <DetailRow>
                      <Label>Quantity</Label>
                      <Value>
                        {selectedBin.qty} / {selectedBin.maxQty}
                      </Value>
                    </DetailRow>

                    {/* 용량 표시 바 */}
                    <ProgressContainer>
                      <ProgressBar>
                        <ProgressFill
                          width={(selectedBin.qty / selectedBin.maxQty) * 100}
                          color={getBinColor(selectedBin.status)}
                        />
                      </ProgressBar>
                      <ProgressLabel>
                        {((selectedBin.qty / selectedBin.maxQty) * 100).toFixed(
                          0
                        )}
                        % Used
                      </ProgressLabel>
                    </ProgressContainer>

                    <ActionButtons>
                      <ActionButton>
                        <FaSearch /> View Stock
                      </ActionButton>
                      <ActionButton>
                        <FaArrowRight /> Transfer
                      </ActionButton>
                    </ActionButtons>
                  </BinDetailCard>
                ) : (
                  <EmptyState>
                    <FaBoxes size={40} color="#ddd" />
                    <p>Select a bin from the map to see details</p>
                  </EmptyState>
                )}
              </DetailPanel>
            </VisualSection>
          </>
        )}
      </ContentArea>
    </Container>
  );
};

export default LocationPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f6fa;
  box-sizing: border-box;
`;

// Sidebar
const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  &:hover {
    background: #133b6b;
  }
`;

const TreeList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const WarehouseGroup = styled.div`
  margin-bottom: 15px;
`;

const WarehouseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 5px;
`;

const WhIcon = styled.div`
  color: #555;
  font-size: 16px;
`;

const WhInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const WhName = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #333;
`;

const WhMeta = styled.div`
  font-size: 11px;
  color: #666;
`;

const ZoneList = styled.div`
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ZoneItem = styled.div`
  padding: 8px 10px;
  font-size: 13px;
  color: ${(props) => (props.$active ? "#1a4f8b" : "#555")};
  background-color: ${(props) => (props.$active ? "#e3f2fd" : "transparent")};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${(props) => (props.$active ? "600" : "400")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#e3f2fd" : "#f5f5f5")};
  }
`;

// Content Area
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TypeBadge = styled.span`
  font-size: 12px;
  background: #eee;
  color: #555;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  vertical-align: middle;
`;

const MetaInfo = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #666;
`;

// Visual Section (Grid Map + Detail)
const VisualSection = styled.div`
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
`;

const MapContainer = styled.div`
  flex: 2;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const GridMap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const BinBox = styled.div`
  aspect-ratio: 1; /* 정사각형 유지 */
  background-color: ${(props) =>
    props.$status === "FULL"
      ? "#ff6b6b"
      : props.$status === "PARTIAL"
      ? "#feca57"
      : "#f1f3f5"};

  border: 2px solid ${(props) => (props.$active ? "#1a4f8b" : "transparent")};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: ${(props) =>
    props.$active ? "0 0 0 2px rgba(26, 79, 139, 0.3)" : "none"};
  opacity: ${(props) => (props.$status === "EMPTY" ? 0.7 : 1)};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const BinCode = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${(props) => (props.$status === "EMPTY" ? "#888" : "white")};
  margin-bottom: 5px;
`;

const Legend = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

// Detail Panel
const DetailPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  gap: 10px;
  font-size: 14px;
`;

const BinDetailCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const BinBigCode = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #333;
`;

const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "FULL"
      ? "#ff6b6b"
      : props.$status === "PARTIAL"
      ? "#feca57"
      : "#e2e6ea"};
  color: ${(props) => (props.$status === "EMPTY" ? "#555" : "white")};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
`;

const Label = styled.div`
  color: #888;
`;

const Value = styled.div`
  font-weight: 600;
  color: #333;
`;

const ProgressContainer = styled.div`
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${(props) => props.width}%;
  height: 100%;
  background-color: ${(props) => props.color};
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  color: #555;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;
