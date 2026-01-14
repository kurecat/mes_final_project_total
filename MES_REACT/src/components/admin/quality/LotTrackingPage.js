// src/pages/quality/LotTrackingPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaBarcode,
  FaProjectDiagram,
  FaHistory,
  FaArrowRight,
  FaBoxOpen,
  FaIndustry,
  FaUser,
  FaMicrochip,
} from "react-icons/fa";

// --- Mock Data ---

// 1. 조회된 Lot의 기본 정보
const LOT_INFO = {
  lotId: "LOT-HBM3-240520-A",
  product: "HBM3 8-Hi Stack Module",
  status: "WIP", // WIP, HOLD, SCRAP, SHIPPED
  currentStep: "OP-MUF-500 (Molded Underfill)",
  qty: 245,
  unit: "ea",
  startDate: "2024-05-20 08:30:00",
  dueDate: "2024-05-22",
  priority: "High",
};

// 2. 계보 정보 (Genealogy: Parent -> Current -> Child)
const GENEALOGY = {
  parents: [
    { id: "WF-SA-001", type: "Wafer", name: "12-inch Si Wafer" },
    { id: "MT-UF-900", type: "Material", name: "Underfill Epoxy" },
    { id: "SB-PKG-102", type: "Substrate", name: "Package Substrate" },
  ],
  current: { id: "LOT-HBM3-240520-A", type: "Lot", name: "HBM3 8-Hi Stack" },
  children: [
    { id: "SHIP-KR-240525", type: "Shipment", name: "Shipping Box #05" },
  ],
};

// 3. 상세 공정 이력 (History)
const HISTORY_LOGS = [
  {
    step: 50,
    op: "Molded Underfill",
    status: "Running",
    equip: "EQ-DSP-01",
    time: "14:20:00",
    user: "Kim",
    qtyIn: 245,
    qtyOut: "-",
    result: "-",
  },
  {
    step: 40,
    op: "Reflow",
    status: "Completed",
    equip: "EQ-REF-01",
    time: "13:10:00",
    user: "Lee",
    qtyIn: 248,
    qtyOut: 245,
    result: "OK",
  },
  {
    step: 30,
    op: "TC Bonding",
    status: "Completed",
    equip: "EQ-TCB-02",
    time: "11:00:00",
    user: "Park",
    qtyIn: 250,
    qtyOut: 248,
    result: "OK",
  },
  {
    step: 20,
    op: "Die Align",
    status: "Completed",
    equip: "EQ-ALN-01",
    time: "09:30:00",
    user: "Choi",
    qtyIn: 250,
    qtyOut: 250,
    result: "OK",
  },
  {
    step: 10,
    op: "Lot Create",
    status: "Created",
    equip: "System",
    time: "08:30:00",
    user: "Admin",
    qtyIn: 0,
    qtyOut: 250,
    result: "Start",
  },
];

const LotTrackingPage = () => {
  const [searchTerm, setSearchTerm] = useState("LOT-HBM3-240520-A");
  const [lotData, setLotData] = useState(LOT_INFO); // 실제론 API 호출 결과

  const handleSearch = () => {
    // API 호출 로직 (Mock)
    alert(`Searching for ${searchTerm}...`);
  };

  return (
    <Container>
      {/* 1. 검색 바 */}
      <SearchSection>
        <TitleArea>
          <PageTitle>
            <FaBarcode /> Lot Tracking & Traceability
          </PageTitle>
          <SubTitle>Lot의 전체 공정 이력 및 자재 계보 추적</SubTitle>
        </TitleArea>
        <SearchBox>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Lot ID..."
          />
          <SearchBtn onClick={handleSearch}>
            <FaSearch /> Track
          </SearchBtn>
        </SearchBox>
      </SearchSection>

      {/* 2. Lot 기본 정보 카드 */}
      <InfoSection>
        <InfoCard>
          <CardLabel>Lot ID</CardLabel>
          <CardValue className="highlight">{lotData.lotId}</CardValue>
        </InfoCard>
        <InfoCard>
          <CardLabel>Product</CardLabel>
          <CardValue>{lotData.product}</CardValue>
        </InfoCard>
        <InfoCard>
          <CardLabel>Current Step</CardLabel>
          <CardValue>{lotData.currentStep}</CardValue>
        </InfoCard>
        <InfoCard>
          <CardLabel>Current Qty</CardLabel>
          <CardValue>
            {lotData.qty} <small>{lotData.unit}</small>
          </CardValue>
        </InfoCard>
        <InfoCard>
          <CardLabel>Status</CardLabel>
          <StatusBadge $status={lotData.status}>{lotData.status}</StatusBadge>
        </InfoCard>
      </InfoSection>

      {/* 3. 계보 시각화 (Genealogy Tree) */}
      <VisualSection>
        <SectionHeader>
          <FaProjectDiagram /> Genealogy View (Process Flow)
        </SectionHeader>
        <GenealogyContainer>
          {/* Parents (자재/원판) */}
          <GenealogyColumn>
            <ColTitle>Inputs (Raw Materials)</ColTitle>
            {GENEALOGY.parents.map((parent) => (
              <NodeCard key={parent.id}>
                <NodeIcon $type="parent">
                  <FaBoxOpen />
                </NodeIcon>
                <NodeInfo>
                  <NodeId>{parent.id}</NodeId>
                  <NodeName>{parent.name}</NodeName>
                </NodeInfo>
              </NodeCard>
            ))}
          </GenealogyColumn>

          <ArrowColumn>
            <FaArrowRight size={24} color="#aaa" />
            <MergeLabel>Merge & Process</MergeLabel>
          </ArrowColumn>

          {/* Current (현재 Lot) */}
          <GenealogyColumn>
            <ColTitle>Current Lot</ColTitle>
            <NodeCard $active>
              <NodeIcon $type="current">
                <FaMicrochip />
              </NodeIcon>
              <NodeInfo>
                <NodeId>{GENEALOGY.current.id}</NodeId>
                <NodeName>{GENEALOGY.current.name}</NodeName>
              </NodeInfo>
            </NodeCard>
          </GenealogyColumn>

          <ArrowColumn>
            <FaArrowRight size={24} color="#aaa" />
          </ArrowColumn>

          {/* Children (출하/Split) */}
          <GenealogyColumn>
            <ColTitle>Output (Children/Ship)</ColTitle>
            {GENEALOGY.children.map((child) => (
              <NodeCard key={child.id}>
                <NodeIcon $type="child">
                  <FaIndustry />
                </NodeIcon>
                <NodeInfo>
                  <NodeId>{child.id}</NodeId>
                  <NodeName>{child.name}</NodeName>
                </NodeInfo>
              </NodeCard>
            ))}
          </GenealogyColumn>
        </GenealogyContainer>
      </VisualSection>

      {/* 4. 상세 이력 테이블 (History) */}
      <HistorySection>
        <SectionHeader>
          <FaHistory /> Process History Log
        </SectionHeader>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Operation</th>
                <th>Status</th>
                <th>Equipment</th>
                <th>Time</th>
                <th>User</th>
                <th>In</th>
                <th>Out</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_LOGS.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.step}</td>
                  <td style={{ fontWeight: "bold" }}>{log.op}</td>
                  <td>
                    <StepStatus $status={log.status}>{log.status}</StepStatus>
                  </td>
                  <td>{log.equip}</td>
                  <td>{log.time}</td>
                  <td>
                    <UserTag>
                      <FaUser size={10} /> {log.user}
                    </UserTag>
                  </td>
                  <td>{log.qtyIn}</td>
                  <td>{log.qtyOut}</td>
                  <td
                    style={{ color: log.result === "OK" ? "#2ecc71" : "#333" }}
                  >
                    {log.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </HistorySection>
    </Container>
  );
};

export default LotTrackingPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

// 1. Search Section
const SearchSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const SearchBox = styled.div`
  display: flex;
  background: white;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  input {
    border: none;
    outline: none;
    padding: 10px;
    width: 250px;
    font-size: 14px;
  }
`;

const SearchBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;

// 2. Info Section
const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  flex-shrink: 0;
`;

const InfoCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CardLabel = styled.span`
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
`;

const CardValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;

  &.highlight {
    color: #1a4f8b;
    font-weight: 700;
  }
  small {
    font-size: 12px;
    color: #666;
    font-weight: 400;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  width: fit-content;
  background-color: ${(props) =>
    props.$status === "WIP" ? "#e3f2fd" : "#eee"};
  color: ${(props) => (props.$status === "WIP" ? "#1976d2" : "#555")};
`;

// 3. Visual Section (Genealogy)
const VisualSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

const SectionHeader = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GenealogyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #ddd;
`;

const GenealogyColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const ColTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 5px;
`;

const ArrowColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const MergeLabel = styled.span`
  font-size: 10px;
  color: #aaa;
  font-weight: 600;
`;

const NodeCard = styled.div`
  width: 200px;
  padding: 12px;
  background: ${(props) => (props.$active ? "#e8f5e9" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#2ecc71" : "#ddd")};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background-color: ${(props) =>
    props.$type === "parent"
      ? "#fff3e0"
      : props.$type === "current"
      ? "#e8f5e9"
      : "#e3f2fd"};
  color: ${(props) =>
    props.$type === "parent"
      ? "#e67e22"
      : props.$type === "current"
      ? "#2e7d32"
      : "#1976d2"};
`;

const NodeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const NodeId = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #333;
`;

const NodeName = styled.div`
  font-size: 11px;
  color: #666;
`;

// 4. History Section
const HistorySection = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 12px;
    background-color: #f9f9f9;
    color: #666;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
  }
`;

const StepStatus = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) =>
    props.$status === "Completed"
      ? "#2ecc71"
      : props.$status === "Running"
      ? "#1a4f8b"
      : "#888"};
`;

const UserTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #555;
`;
