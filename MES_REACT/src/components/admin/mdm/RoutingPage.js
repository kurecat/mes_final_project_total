// src/pages/mdm/RoutingPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaProjectDiagram,
  FaSearch,
  FaPlus,
  FaArrowRight,
  FaCogs,
  FaMicroscope,
  FaBroom,
  FaBox,
  FaClock,
  FaSave,
  FaEdit,
} from "react-icons/fa";

// --- Mock Data (HBM 제조 공정 라우팅) ---
const ROUTING_LIST = [
  {
    id: "RT-HBM3-STACK",
    name: "HBM3 8-Hi Stacking Process",
    version: "Ver 2.1",
    status: "ACTIVE",
    description: "TSV Die 8단 적층 표준 공정",
    totalSteps: 6,
    operations: [
      {
        step: 10,
        id: "OP-CLN-100",
        name: "Wafer Cleaning",
        type: "CLEAN",
        resource: "Wet Station",
        ct: 300,
        yield: 99.9,
        desc: "Flux 잔여물 제거 및 표면 세정",
      },
      {
        step: 20,
        id: "OP-ALN-200",
        name: "Die Align",
        type: "PROCESS",
        resource: "Aligner",
        ct: 45,
        yield: 99.8,
        desc: "Micro Bump 정밀 정렬",
      },
      {
        step: 30,
        id: "OP-BND-300",
        name: "TC Bonding",
        type: "PROCESS",
        resource: "TC Bonder",
        ct: 120,
        yield: 99.5,
        desc: "열압착 본딩 (350°C, 50N)",
      },
      {
        step: 40,
        id: "OP-RFL-400",
        name: "Reflow",
        type: "PROCESS",
        resource: "Reflow Oven",
        ct: 600,
        yield: 99.9,
        desc: "Mass Reflow 공정",
      },
      {
        step: 50,
        id: "OP-MUF-500",
        name: "Molded Underfill",
        type: "PROCESS",
        resource: "Dispenser",
        ct: 240,
        yield: 99.2,
        desc: "Epoxy 도포 및 경화",
      },
      {
        step: 60,
        id: "OP-ISP-600",
        name: "Final Inspection",
        type: "INSPECT",
        resource: "AOI Machine",
        ct: 60,
        yield: 98.5,
        desc: "외관 및 X-Ray 검사",
      },
    ],
  },
  {
    id: "RT-DDR5-ASSY",
    name: "DDR5 Module Assembly",
    version: "Ver 1.0",
    status: "DRAFT",
    description: "DDR5 UDIMM SMT 공정",
    totalSteps: 4,
    operations: [
      {
        step: 10,
        id: "OP-PRT-100",
        name: "Solder Paste Print",
        type: "PROCESS",
        resource: "Screen Printer",
        ct: 25,
        yield: 99.9,
        desc: "솔더 페이스트 도포",
      },
      {
        step: 20,
        id: "OP-MNT-200",
        name: "Chip Mount",
        type: "PROCESS",
        resource: "Mounter",
        ct: 40,
        yield: 99.8,
        desc: "부품 실장",
      },
      {
        step: 30,
        id: "OP-RFL-300",
        name: "Reflow",
        type: "PROCESS",
        resource: "Reflow Oven",
        ct: 300,
        yield: 99.9,
        desc: "납땜 경화",
      },
      {
        step: 40,
        id: "OP-AOI-400",
        name: "AOI Inspection",
        type: "INSPECT",
        resource: "AOI",
        ct: 30,
        yield: 99.5,
        desc: "비전 검사",
      },
    ],
  },
];

const RoutingPage = () => {
  const [selectedRouting, setSelectedRouting] = useState(ROUTING_LIST[0]);
  const [selectedStep, setSelectedStep] = useState(
    ROUTING_LIST[0].operations[0]
  );
  const [searchTerm, setSearchTerm] = useState("");

  // 공정 타입별 아이콘 매핑
  const getStepIcon = (type) => {
    switch (type) {
      case "CLEAN":
        return <FaBroom />;
      case "PROCESS":
        return <FaCogs />;
      case "INSPECT":
        return <FaMicroscope />;
      case "PACK":
        return <FaBox />;
      default:
        return <FaCogs />;
    }
  };

  // 라우팅 선택 핸들러
  const handleRoutingClick = (routing) => {
    setSelectedRouting(routing);
    setSelectedStep(routing.operations[0]); // 첫 번째 공정 자동 선택
  };

  // 필터링
  const filteredList = ROUTING_LIST.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      {/* 1. 좌측 사이드바: 라우팅 목록 */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaProjectDiagram /> Routing List
          </Title>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search Routing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton>
            <FaPlus /> New Routing
          </AddButton>
        </SidebarHeader>

        <ListArea>
          {filteredList.map((routing) => (
            <RoutingItem
              key={routing.id}
              $active={selectedRouting.id === routing.id}
              onClick={() => handleRoutingClick(routing)}
            >
              <ItemHeader>
                <ItemName>{routing.name}</ItemName>
                <StatusBadge $status={routing.status}>
                  {routing.status}
                </StatusBadge>
              </ItemHeader>
              <ItemMeta>
                {routing.id} | {routing.version}
              </ItemMeta>
            </RoutingItem>
          ))}
        </ListArea>
      </Sidebar>

      {/* 2. 우측 컨텐츠: 공정 흐름도 및 상세 */}
      <ContentArea>
        {selectedRouting && (
          <>
            {/* 상단 헤더 정보 */}
            <HeaderSection>
              <HeaderTitle>
                {selectedRouting.name}{" "}
                <VersionTag>{selectedRouting.version}</VersionTag>
              </HeaderTitle>
              <HeaderDesc>{selectedRouting.description}</HeaderDesc>
            </HeaderSection>

            {/* A. 공정 흐름도 (Flowchart Visualization) */}
            <FlowSection>
              <SectionTitle>Process Flow (Operation Sequence)</SectionTitle>
              <FlowContainer>
                {selectedRouting.operations.map((op, index) => (
                  <React.Fragment key={op.id}>
                    <FlowStep
                      $active={selectedStep?.id === op.id}
                      onClick={() => setSelectedStep(op)}
                    >
                      <StepNumber>{op.step}</StepNumber>
                      <StepIconWrapper $type={op.type}>
                        {getStepIcon(op.type)}
                      </StepIconWrapper>
                      <StepName>{op.name}</StepName>
                    </FlowStep>
                    {/* 마지막 단계가 아니면 화살표 표시 */}
                    {index < selectedRouting.operations.length - 1 && (
                      <ArrowWrapper>
                        <FaArrowRight />
                      </ArrowWrapper>
                    )}
                  </React.Fragment>
                ))}
              </FlowContainer>
            </FlowSection>

            {/* B. 선택된 공정 상세 설정 (Detail Editor) */}
            <DetailSection>
              <DetailHeader>
                <SectionTitle>
                  Operation Detail: {selectedStep.name}
                </SectionTitle>
                <ActionGroup>
                  <Button>
                    <FaEdit /> Edit Spec
                  </Button>
                  <Button $primary>
                    <FaSave /> Save Changes
                  </Button>
                </ActionGroup>
              </DetailHeader>

              <DetailGrid>
                <FormCard>
                  <FormTitle>General Info</FormTitle>
                  <InputGroup>
                    <Label>Operation ID</Label>
                    <ValueInput value={selectedStep.id} readOnly />
                  </InputGroup>
                  <InputGroup>
                    <Label>Operation Name</Label>
                    <ValueInput value={selectedStep.name} readOnly />
                  </InputGroup>
                  <InputGroup>
                    <Label>Operation Type</Label>
                    <Select value={selectedStep.type} disabled>
                      <option value="PROCESS">Processing</option>
                      <option value="INSPECT">Inspection</option>
                      <option value="CLEAN">Cleaning</option>
                    </Select>
                  </InputGroup>
                </FormCard>

                <FormCard>
                  <FormTitle>Standard & Resource</FormTitle>
                  <InputGroup>
                    <Label>Target Resource (Equipment)</Label>
                    <ValueInput value={selectedStep.resource} readOnly />
                  </InputGroup>
                  <InputGroup>
                    <Label>Std Cycle Time (Sec)</Label>
                    <ValueInput value={selectedStep.ct} readOnly />
                  </InputGroup>
                  <InputGroup>
                    <Label>Target Yield (%)</Label>
                    <ValueInput value={selectedStep.yield} readOnly />
                  </InputGroup>
                </FormCard>

                <FormCard style={{ gridColumn: "span 2" }}>
                  <FormTitle>Work Instruction / Description</FormTitle>
                  <TextArea rows="3" value={selectedStep.desc} readOnly />
                </FormCard>
              </DetailGrid>
            </DetailSection>
          </>
        )}
      </ContentArea>
    </Container>
  );
};

export default RoutingPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f6fa;
  box-sizing: border-box;
`;

// Sidebar Styles
const Sidebar = styled.div`
  width: 320px;
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

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    width: 100%;
    outline: none;
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
  gap: 5px;
  font-weight: 600;
  &:hover {
    background-color: #133b6b;
  }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoutingItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  background-color: ${(props) => (props.$active ? "#eef2f8" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};
  &:hover {
    background-color: #f9f9f9;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "ACTIVE" ? "#e8f5e9" : "#eee"};
  color: ${(props) => (props.$status === "ACTIVE" ? "#2e7d32" : "#888")};
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #888;
`;

// Content Styles
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

const VersionTag = styled.span`
  font-size: 12px;
  background: #333;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  vertical-align: middle;
`;

const HeaderDesc = styled.div`
  margin-top: 5px;
  color: #666;
  font-size: 14px;
`;

// Flowchart Section
const FlowSection = styled.div`
  padding: 20px 30px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  overflow-x: auto; /* 가로 스크롤 허용 */
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 700;
`;

const FlowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  min-width: max-content; /* 내용물만큼 너비 확보 */
`;

const FlowStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  transform: ${(props) => (props.$active ? "scale(1.05)" : "scale(1)")};
  transition: all 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const StepNumber = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #888;
  margin-bottom: 5px;
`;

const StepIconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.$type === "CLEAN"
      ? "#e3f2fd"
      : props.$type === "INSPECT"
      ? "#f3e5f5"
      : "#e8f5e9"};
  color: ${(props) =>
    props.$type === "CLEAN"
      ? "#1976d2"
      : props.$type === "INSPECT"
      ? "#7b1fa2"
      : "#2e7d32"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 2px solid
    ${(props) => (props.theme?.active ? "#1a4f8b" : "transparent")}; // 테마 연동 가능
`;

const StepName = styled.div`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  width: 80px;
  word-break: keep-all;
`;

const ArrowWrapper = styled.div`
  color: #ccc;
  font-size: 14px;
  margin-bottom: 25px; /* 텍스트 높이 고려하여 아이콘 위치 조정 */
`;

// Detail Section
const DetailSection = styled.div`
  flex: 1;
  background: #f5f6fa;
  padding: 20px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background-color: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  &:hover {
    opacity: 0.9;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1a4f8b;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 5px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

const ValueInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  color: #333;
  outline: none;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  resize: vertical;
`;
