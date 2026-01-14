// src/pages/mdm/EquipmentPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaPlus,
  FaServer,
  FaTools,
  FaCalendarAlt,
  FaNetworkWired,
  FaHdd,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

// --- Mock Data (설비 자산 데이터) ---
const EQUIPMENT_LIST = [
  {
    id: "EQ-TCB-01",
    name: "TC Bonder #01",
    model: "BESI-8800-H",
    vendor: "BESI",
    location: "Line-A (Stacking)",
    status: "ACTIVE", // ACTIVE, DISPOSED, MAINTENANCE
    installDate: "2022-01-15",
    network: { ip: "192.168.10.101", port: "5000", protocol: "SECS/GEM" },
    maintenance: {
      lastPm: "2024-04-20",
      nextPm: "2024-05-20",
      cycle: "30 Days",
    },
    specs: { power: "380V", air: "5.5 bar", weight: "1200kg" },
  },
  {
    id: "EQ-TCB-02",
    name: "TC Bonder #02",
    model: "BESI-8800-H",
    vendor: "BESI",
    location: "Line-A (Stacking)",
    status: "ACTIVE",
    installDate: "2022-02-10",
    network: { ip: "192.168.10.102", port: "5000", protocol: "SECS/GEM" },
    maintenance: {
      lastPm: "2024-04-20",
      nextPm: "2024-05-20",
      cycle: "30 Days",
    },
    specs: { power: "380V", air: "5.5 bar", weight: "1200kg" },
  },
  {
    id: "EQ-REF-01",
    name: "Reflow Oven A",
    model: "MK-V-1000",
    vendor: "Heller",
    location: "Line-B (Reflow)",
    status: "MAINTENANCE",
    installDate: "2021-11-05",
    network: { ip: "192.168.20.101", port: "502", protocol: "Modbus TCP" },
    maintenance: {
      lastPm: "2024-04-01",
      nextPm: "2024-05-01",
      cycle: "30 Days",
    }, // PM 기한 지남
    specs: { power: "220V", air: "N2 Purge", weight: "800kg" },
  },
  {
    id: "EQ-TSV-05",
    name: "TSV Etcher #05",
    model: "Lam-Kiyo-45",
    vendor: "Lam Research",
    location: "Line-C (Etch)",
    status: "ACTIVE",
    installDate: "2023-03-20",
    network: { ip: "192.168.30.55", port: "7000", protocol: "HSMS" },
    maintenance: {
      lastPm: "2024-05-10",
      nextPm: "2024-08-10",
      cycle: "90 Days",
    },
    specs: { power: "480V", air: "Vacuum", weight: "2500kg" },
  },
];

const EquipmentPage = () => {
  const [selectedEq, setSelectedEq] = useState(EQUIPMENT_LIST[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // 필터링
  const filteredList = EQUIPMENT_LIST.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PM 상태 계산 (기한 임박/지남 확인)
  const getPmStatus = (nextDate) => {
    const today = new Date();
    const next = new Date(nextDate);
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));

    if (diff < 0)
      return { text: `Overdue (${Math.abs(diff)} days)`, color: "#c62828" };
    if (diff <= 7) return { text: `Due in ${diff} days`, color: "#f39c12" };
    return { text: `${diff} days left`, color: "#27ae60" };
  };

  return (
    <Container>
      {/* 1. 좌측: 설비 목록 리스트 */}
      <ListSection>
        <ListHeader>
          <Title>Equipment List</Title>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton>
            <FaPlus /> Add New
          </AddButton>
        </ListHeader>

        <ScrollList>
          {filteredList.map((eq) => (
            <ListItem
              key={eq.id}
              $active={selectedEq.id === eq.id}
              onClick={() => setSelectedEq(eq)}
            >
              <ItemIconWrapper>
                <FaServer />
              </ItemIconWrapper>
              <ItemInfo>
                <ItemName>{eq.name}</ItemName>
                <ItemId>{eq.id}</ItemId>
              </ItemInfo>
              <StatusDot $status={eq.status} />
            </ListItem>
          ))}
        </ScrollList>
      </ListSection>

      {/* 2. 우측: 상세 정보 패널 */}
      <DetailSection>
        {/* 헤더 */}
        <DetailHeader>
          <HeaderLeft>
            <DetailTitle>{selectedEq.name}</DetailTitle>
            <DetailSub>
              {selectedEq.model} | {selectedEq.vendor}
            </DetailSub>
          </HeaderLeft>
          <HeaderRight>
            <StatusBadge $status={selectedEq.status}>
              {selectedEq.status}
            </StatusBadge>
            <EditButton>
              <FaEdit /> Edit
            </EditButton>
            <DeleteButton>
              <FaTrash />
            </DeleteButton>
          </HeaderRight>
        </DetailHeader>

        <DetailContent>
          {/* A. 기본 정보 & 스펙 */}
          <CardGrid>
            <InfoCard>
              <CardTitle>
                <FaHdd /> General Information
              </CardTitle>
              <Row>
                <Label>Equipment ID</Label> <Value>{selectedEq.id}</Value>
              </Row>
              <Row>
                <Label>Location</Label> <Value>{selectedEq.location}</Value>
              </Row>
              <Row>
                <Label>Install Date</Label>{" "}
                <Value>{selectedEq.installDate}</Value>
              </Row>
              <Divider />
              <Row>
                <Label>Power Spec</Label>{" "}
                <Value>{selectedEq.specs.power}</Value>
              </Row>
              <Row>
                <Label>Weight</Label> <Value>{selectedEq.specs.weight}</Value>
              </Row>
            </InfoCard>

            {/* B. 네트워크 설정 (MES 연동용) */}
            <InfoCard>
              <CardTitle>
                <FaNetworkWired /> Network & Interface
              </CardTitle>
              <Row>
                <Label>IP Address</Label>
                <Value className="mono">{selectedEq.network.ip}</Value>
              </Row>
              <Row>
                <Label>Port</Label>
                <Value className="mono">{selectedEq.network.port}</Value>
              </Row>
              <Row>
                <Label>Protocol</Label>
                <Value>{selectedEq.network.protocol}</Value>
              </Row>
              <NetworkStatus>
                <StatusIndicator $online={true} /> Online (Ping: 12ms)
              </NetworkStatus>
            </InfoCard>
          </CardGrid>

          {/* C. 유지보수(PM) 현황 */}
          <FullWidthCard>
            <CardTitle>
              <FaTools /> Maintenance Schedule (PM)
            </CardTitle>
            <PMContainer>
              <PMItem>
                <PMLabel>Last PM Date</PMLabel>
                <PMValue>{selectedEq.maintenance.lastPm}</PMValue>
              </PMItem>
              <PMItem>
                <PMLabel>Cycle</PMLabel>
                <PMValue>{selectedEq.maintenance.cycle}</PMValue>
              </PMItem>
              <PMItem>
                <PMLabel>Next Schedule</PMLabel>
                <PMValue
                  style={{
                    color: getPmStatus(selectedEq.maintenance.nextPm).color,
                    fontWeight: "bold",
                  }}
                >
                  {selectedEq.maintenance.nextPm}
                </PMValue>
                <PMSmall>
                  {getPmStatus(selectedEq.maintenance.nextPm).text}
                </PMSmall>
              </PMItem>
              <PMAction>
                <FaCalendarAlt /> Schedule PM
              </PMAction>
            </PMContainer>

            {/* 시각적 진행바 */}
            <ProgressBarContainer>
              <ProgressLabel>PM Cycle Progress</ProgressLabel>
              <ProgressBarBase>
                {/* 예시로 70% 진행됨 */}
                <ProgressBarFill $percent={70} />
              </ProgressBarBase>
            </ProgressBarContainer>
          </FullWidthCard>
        </DetailContent>
      </DetailSection>
    </Container>
  );
};

export default EquipmentPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f6fa;
  box-sizing: border-box;
`;

// Left Section
const ListSection = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const ListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;

  input {
    border: none;
    background: transparent;
    margin-left: 10px;
    outline: none;
    width: 100%;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  &:hover {
    background-color: #133b6b;
  }
`;

const ScrollList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ListItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  background-color: ${(props) => (props.$active ? "#e3f2fd" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};

  &:hover {
    background-color: #f0f7ff;
  }
`;

const ItemIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const ItemId = styled.div`
  font-size: 12px;
  color: #888;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$status === "ACTIVE"
      ? "#2ecc71"
      : props.$status === "MAINTENANCE"
      ? "#f39c12"
      : "#ccc"};
`;

// Right Section
const DetailSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div``;

const DetailTitle = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #333;
`;

const DetailSub = styled.div`
  color: #666;
  margin-top: 5px;
  font-size: 14px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "ACTIVE"
      ? "#e8f5e9"
      : props.$status === "MAINTENANCE"
      ? "#fff3e0"
      : "#eee"};
  color: ${(props) =>
    props.$status === "ACTIVE"
      ? "#2e7d32"
      : props.$status === "MAINTENANCE"
      ? "#e67e22"
      : "#888"};
`;

const ActionButton = styled.button`
  padding: 8px 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-weight: 600;

  &:hover {
    background: #f5f5f5;
  }
`;

const EditButton = styled(ActionButton)`
  color: #1a4f8b;
  border-color: #1a4f8b;
`;

const DeleteButton = styled(ActionButton)`
  color: #c62828;
  border-color: #ef9a9a;
  &:hover {
    background: #ffebee;
  }
`;

const DetailContent = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const InfoCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const FullWidthCard = styled(InfoCard)`
  width: 100%;
  box-sizing: border-box;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
`;

const Label = styled.span`
  color: #888;
`;

const Value = styled.span`
  color: #333;
  font-weight: 500;
  &.mono {
    font-family: monospace;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 15px 0;
`;

const NetworkStatus = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #f1f8e9;
  border-radius: 6px;
  color: #33691e;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$online ? "#2ecc71" : "#ccc")};
`;

const PMContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PMItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PMLabel = styled.span`
  font-size: 12px;
  color: #888;
`;

const PMValue = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

const PMSmall = styled.span`
  font-size: 12px;
`;

const PMAction = styled.button`
  background: #f39c12;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;

  &:hover {
    background: #e67e22;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const ProgressBarBase = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background: #1a4f8b;
  border-radius: 4px;
`;
