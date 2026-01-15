// src/pages/resource/MachinePage.js
import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaCogs,
  FaThermometerHalf,
  FaBolt,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaTools,
  FaMicrochip, // 아이콘 변경 (Chip)
} from "react-icons/fa";

// --- Mock Data (D-RAM Fab & EDS 설비) ---
const MACHINE_DATA = [
  {
    id: "EQ-PHO-01",
    name: "Photo Stepper #01 (ASML)",
    type: "Photo",
    status: "RUN",
    lotId: "LOT-DDR5-240601-A",
    uph: 140, // Wafers per Hour
    temperature: 23.5, // 정밀 온도 제어 필요
    param: "Focus: 0.05um", // 주요 파라미터 (Focus/Dose)
    progress: 82,
  },
  {
    id: "EQ-ETC-03",
    name: "Poly Etcher #03 (Lam)",
    type: "Etch",
    status: "RUN",
    lotId: "LOT-DDR5-240601-B",
    uph: 55,
    temperature: 65,
    param: "Gas: 450sccm", // 가스 유량
    progress: 45,
  },
  {
    id: "EQ-DEP-02",
    name: "CVD Deposition #02",
    type: "Deposition",
    status: "DOWN", // 고장
    errorCode: "ERR-503: Gas Flow Low",
    lotId: "LOT-DDR5-240601-C",
    uph: 0,
    temperature: 450, // 고온 공정
    param: "Vac: 2.1Torr",
    progress: 12,
  },
  {
    id: "EQ-EDS-01",
    name: "EDS Tester #01 (Advantest)",
    type: "Test",
    status: "RUN",
    lotId: "LOT-DDR5-TEST-09",
    uph: 3, // Wafer Test는 오래 걸림
    temperature: 85, // Burn-in Temp
    param: "Yield: 98.2%", // 현재 수율 표시
    progress: 98,
  },
  {
    id: "EQ-IMP-05",
    name: "Ion Implanter #05",
    type: "Implant",
    status: "IDLE", // 대기 중
    lotId: "-",
    uph: 0,
    temperature: 24,
    param: "Beam: 0mA",
    progress: 0,
  },
  {
    id: "EQ-CMP-02",
    name: "CMP Polisher #02",
    type: "CMP",
    status: "PM", // 예방 정비 (Preventive Maintenance)
    lotId: "-",
    uph: 0,
    temperature: 22,
    param: "-",
    progress: 0,
  },
];

const MachinePage = () => {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const statusCounts = {
    TOTAL: MACHINE_DATA.length,
    RUN: MACHINE_DATA.filter((m) => m.status === "RUN").length,
    DOWN: MACHINE_DATA.filter((m) => m.status === "DOWN").length,
    IDLE: MACHINE_DATA.filter((m) => m.status === "IDLE").length,
  };

  const filteredData = MACHINE_DATA.filter(
    (item) => filterStatus === "ALL" || item.status === filterStatus
  );

  return (
    <Container>
      {/* 1. 상단 요약 바 */}
      <SummaryBar>
        <SummaryItem
          onClick={() => setFilterStatus("ALL")}
          $active={filterStatus === "ALL"}
        >
          <Label>Total Equipments</Label>
          <Value>{statusCounts.TOTAL}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("RUN")}
          $active={filterStatus === "RUN"}
          $color="#2ecc71"
        >
          <Label>Running (Prod)</Label>
          <Value>{statusCounts.RUN}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("IDLE")}
          $active={filterStatus === "IDLE"}
          $color="#f1c40f"
        >
          <Label>Idle / Standby</Label>
          <Value>{statusCounts.IDLE}</Value>
        </SummaryItem>
        <SummaryItem
          onClick={() => setFilterStatus("DOWN")}
          $active={filterStatus === "DOWN"}
          $color="#e74c3c"
        >
          <Label>Down / Trouble</Label>
          <Value>{statusCounts.DOWN}</Value>
        </SummaryItem>
      </SummaryBar>

      {/* 2. 컨트롤 영역 */}
      <ControlSection>
        <Title>Fab Equipment Monitoring</Title>
        <FilterGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input placeholder="Search EQ ID..." />
          </SearchBox>
          <FilterButton>
            <FaFilter /> Filter
          </FilterButton>
        </FilterGroup>
      </ControlSection>

      {/* 3. 설비 카드 그리드 */}
      <GridContainer>
        {filteredData.map((machine) => (
          <MachineCard key={machine.id} $status={machine.status}>
            <CardHeader $status={machine.status}>
              <MachineName>
                <FaMicrochip /> {machine.name}
              </MachineName>
              <StatusBadge $status={machine.status}>
                {machine.status === "RUN" && <FaPlay size={10} />}
                {machine.status === "IDLE" && <FaStop size={10} />}
                {machine.status === "DOWN" && (
                  <FaExclamationTriangle size={10} />
                )}
                {machine.status === "PM" && <FaTools size={10} />}
                <span>{machine.status}</span>
              </StatusBadge>
            </CardHeader>

            <CardBody>
              <InfoRow>
                <InfoLabel>Current Lot</InfoLabel>
                <InfoValue className="lot">{machine.lotId}</InfoValue>
              </InfoRow>

              <MetricGrid>
                <MetricItem>
                  <FaBolt color="#f1c40f" />
                  <span>{machine.uph} WPH</span> {/* Wafer Per Hour */}
                </MetricItem>
                <MetricItem>
                  <FaThermometerHalf color="#e74c3c" />
                  <span>{machine.temperature}°C</span>
                </MetricItem>
              </MetricGrid>

              {/* 주요 파라미터 표시 (장비별 다름) */}
              <ParamRow>
                <ParamLabel>Main Param:</ParamLabel>
                <ParamValue>{machine.param}</ParamValue>
              </ParamRow>

              {machine.status === "DOWN" ? (
                <ErrorBox>{machine.errorCode}</ErrorBox>
              ) : (
                <ProgressWrapper>
                  <ProgressLabel>
                    <span>Process Progress</span>
                    <span>{machine.progress}%</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill
                      $percent={machine.progress}
                      $status={machine.status}
                    />
                  </ProgressBar>
                </ProgressWrapper>
              )}
            </CardBody>

            <CardFooter>
              <DetailButton>Equipment Detail</DetailButton>
            </CardFooter>
          </MachineCard>
        ))}
      </GridContainer>
    </Container>
  );
};

export default MachinePage;

// --- Styled Components (기존과 동일하게 유지) ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
`;

const SummaryBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const SummaryItem = styled.div`
  flex: 1;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border-left: 4px solid ${(props) => props.$color || "#1a4f8b"};
  transition: all 0.2s;
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  transform: ${(props) => (props.$active ? "translateY(-2px)" : "none")};
  &:hover {
    opacity: 1;
  }
`;
const Label = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
`;
const Value = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #333;
`;

const ControlSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  input {
    border: none;
    outline: none;
    margin-left: 10px;
    font-size: 14px;
  }
`;
const FilterButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #555;
  &:hover {
    background: #f9f9f9;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
`;

const blink = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
`;

const MachineCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  border: 1px solid #eee;
  ${(props) =>
    props.$status === "DOWN" &&
    css`
      border-color: #e74c3c;
      animation: ${blink} 2s infinite;
    `}
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 15px;
  background-color: ${(props) =>
    props.$status === "RUN"
      ? "#e8f5e9"
      : props.$status === "DOWN"
      ? "#ffebee"
      : props.$status === "IDLE"
      ? "#fff8e1"
      : "#f5f5f5"};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const MachineName = styled.div`
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
`;
const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: white;
  color: ${(props) =>
    props.$status === "RUN"
      ? "#2ecc71"
      : props.$status === "DOWN"
      ? "#e74c3c"
      : props.$status === "IDLE"
      ? "#f1c40f"
      : "#95a5a6"};
`;

const CardBody = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const InfoLabel = styled.span`
  font-size: 13px;
  color: #888;
`;
const InfoValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
  &.lot {
    color: #1a4f8b;
    font-family: monospace;
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background-color: #fafafa;
  padding: 10px;
  border-radius: 8px;
`;
const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  font-weight: 600;
`;

const ParamRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-top: -5px;
`;
const ParamLabel = styled.span`
  color: #888;
`;
const ParamValue = styled.span`
  color: #555;
  font-weight: 600;
`;

const ErrorBox = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #ef9a9a;
`;

const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background-color: ${(props) =>
    props.$status === "RUN" ? "#2ecc71" : "#f1c40f"};
  transition: width 0.3s ease;
`;

const CardFooter = styled.div`
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: center;
`;
const DetailButton = styled.button`
  width: 100%;
  padding: 8px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #1a4f8b;
    color: white;
    border-color: #1a4f8b;
  }
`;
