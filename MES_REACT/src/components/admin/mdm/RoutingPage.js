// src/pages/mdm/RoutingPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axios from "axios";
import {
  FaProjectDiagram,
  FaSearch,
  FaPlus,
  FaArrowRight,
  FaCogs,
  FaMicroscope,
  FaBroom,
  FaBox,
  FaSave,
  FaEdit,
  FaLayerGroup,
  FaBolt,
  FaSync,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_ROUTINGS = [
  {
    id: "RT-DDR5-FAB-01",
    name: "DDR5 FEOL Standard Process",
    version: "Ver 3.5",
    status: "ACTIVE",
    description: "1znm Class D-RAM Wafer 전공정 표준",
    totalSteps: 6,
    operations: [
      {
        step: 10,
        id: "OP-CLN-100",
        name: "Pre-Gate Cleaning",
        type: "CLEAN",
        resource: "Wet Station",
        ct: 300,
        yield: 99.9,
        desc: "웨이퍼 표면 유기물 및 자연 산화막 제거",
      },
      {
        step: 20,
        id: "OP-PHO-200",
        name: "Gate Lithography",
        type: "PROCESS",
        resource: "Photo Stepper",
        ct: 45,
        yield: 99.5,
        desc: "Gate 회로 패턴 노광 (EUV Layer 포함)",
      },
      {
        step: 30,
        id: "OP-ETC-300",
        name: "Gate Etching",
        type: "PROCESS",
        resource: "Dry Etcher",
        ct: 120,
        yield: 99.2,
        desc: "플라즈마 식각을 통한 패턴 형성",
      },
      {
        step: 40,
        id: "OP-DEP-400",
        name: "Spacer Deposition",
        type: "PROCESS",
        resource: "CVD",
        ct: 200,
        yield: 99.8,
        desc: "절연막 증착 공정",
      },
      {
        step: 50,
        id: "OP-IMP-500",
        name: "Source/Drain Implant",
        type: "PROCESS",
        resource: "Ion Implanter",
        ct: 150,
        yield: 99.9,
        desc: "이온 주입을 통한 도핑",
      },
      {
        step: 60,
        id: "OP-CMP-600",
        name: "Planarization (CMP)",
        type: "PROCESS",
        resource: "CMP Polisher",
        ct: 180,
        yield: 99.7,
        desc: "표면 평탄화 및 연마",
      },
    ],
  },
  {
    id: "RT-DDR5-EDS-02",
    name: "DDR5 EDS Test Flow",
    version: "Ver 1.2",
    status: "ACTIVE",
    description: "Electrical Die Sorting 및 수리 공정",
    totalSteps: 4,
    operations: [
      {
        step: 10,
        id: "OP-PRB-100",
        name: "Wafer Burn-in",
        type: "TEST",
        resource: "Burn-in Chamber",
        ct: 3600,
        yield: 99.0,
        desc: "고온/고전압 스트레스 테스트",
      },
      {
        step: 20,
        id: "OP-HOT-200",
        name: "Hot/Cold Test",
        type: "TEST",
        resource: "Probe Station",
        ct: 600,
        yield: 95.5,
        desc: "온도별 전기적 특성 검사",
      },
      {
        step: 30,
        id: "OP-REP-300",
        name: "Laser Repair",
        type: "PROCESS",
        resource: "Laser Trimmer",
        ct: 120,
        yield: 100.0,
        desc: "불량 셀 Redundancy 회로로 대체 (수리)",
      },
      {
        step: 40,
        id: "OP-FST-400",
        name: "Final Sorting",
        type: "INSPECT",
        resource: "Sorter",
        ct: 60,
        yield: 94.8,
        desc: "양품/불량품 Binning 분류",
      },
    ],
  },
];

// --- Helper Functions ---
const getStepIcon = (type) => {
  switch (type) {
    case "CLEAN":
      return <FaBroom />;
    case "PROCESS":
      return <FaLayerGroup />;
    case "INSPECT":
      return <FaMicroscope />;
    case "TEST":
      return <FaBolt />;
    case "PACK":
      return <FaBox />;
    default:
      return <FaCogs />;
  }
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Sidebar Component
const RoutingSidebar = React.memo(
  ({
    loading,
    searchTerm,
    onSearchChange,
    filteredList,
    selectedRoutingId,
    onRoutingClick,
    onAddClick,
  }) => {
    return (
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaProjectDiagram /> Routing List
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 12, marginLeft: 8 }}
              />
            )}
          </Title>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search Routing..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
          <AddButton onClick={onAddClick}>
            <FaPlus /> New Routing
          </AddButton>
        </SidebarHeader>

        <ListArea>
          {filteredList.map((routing) => (
            <RoutingItem
              key={routing.id}
              $active={selectedRoutingId === routing.id}
              onClick={() => onRoutingClick(routing)}
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
    );
  },
);

// 2. Flowchart Component
const RoutingFlow = React.memo(
  ({ operations, selectedStepId, onStepClick }) => {
    return (
      <FlowSection>
        <SectionTitle>Process Flow (Operation Sequence)</SectionTitle>
        <FlowContainer>
          {operations.map((op, index) => (
            <React.Fragment key={op.id}>
              <FlowStep
                $active={selectedStepId === op.id}
                onClick={() => onStepClick(op)}
              >
                <StepNumber>{op.step}</StepNumber>
                <StepIconWrapper
                  $type={op.type}
                  $active={selectedStepId === op.id}
                >
                  {getStepIcon(op.type)}
                </StepIconWrapper>
                <StepName>{op.name}</StepName>
              </FlowStep>
              {index < operations.length - 1 && (
                <ArrowWrapper>
                  <FaArrowRight />
                </ArrowWrapper>
              )}
            </React.Fragment>
          ))}
        </FlowContainer>
      </FlowSection>
    );
  },
);

// 3. Step Detail Component
const StepDetail = React.memo(({ selectedStep, onSave }) => {
  if (!selectedStep) return null;

  return (
    <DetailSection>
      <DetailHeader>
        <SectionTitle>Operation Detail: {selectedStep.name}</SectionTitle>
        <ActionGroup>
          <Button>
            <FaEdit /> Edit Spec
          </Button>
          <Button $primary onClick={onSave}>
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
              <option value="TEST">Electrical Test</option>
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
  );
});

// --- Main Component ---

const RoutingPage = () => {
  const [routingList, setRoutingList] = useState(MOCK_ROUTINGS);
  const [selectedRouting, setSelectedRouting] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      // const res = await axios.get("http://localhost:3001/routings");
      // setRoutingList(res.data);
      // if (res.data.length > 0) { ... }

      setTimeout(() => {
        setRoutingList(MOCK_ROUTINGS);
        setSelectedRouting(MOCK_ROUTINGS[0]);
        setSelectedStep(MOCK_ROUTINGS[0].operations[0]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handlers - useCallback
  const handleRoutingClick = useCallback((routing) => {
    setSelectedRouting(routing);
    setSelectedStep(routing.operations[0]);
  }, []);

  const handleStepClick = useCallback((op) => {
    setSelectedStep(op);
  }, []);

  const handleSaveStep = useCallback(() => {
    if (selectedStep) {
      alert(`[${selectedStep.name}] 공정 정보가 저장되었습니다.`);
    }
  }, [selectedStep]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddClick = useCallback(() => {
    alert("Add Routing Modal Open");
  }, []);

  // 3. Filtering - useMemo
  const filteredList = useMemo(() => {
    return routingList.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [routingList, searchTerm]);

  return (
    <Container>
      {/* 1. 좌측 사이드바 */}
      <RoutingSidebar
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredList={filteredList}
        selectedRoutingId={selectedRouting?.id}
        onRoutingClick={handleRoutingClick}
        onAddClick={handleAddClick}
      />

      {/* 2. 우측 컨텐츠 */}
      <ContentArea>
        {selectedRouting ? (
          <>
            <HeaderSection>
              <HeaderTitle>
                {selectedRouting.name}{" "}
                <VersionTag>{selectedRouting.version}</VersionTag>
              </HeaderTitle>
              <HeaderDesc>{selectedRouting.description}</HeaderDesc>
            </HeaderSection>

            {/* A. 공정 흐름도 */}
            <RoutingFlow
              operations={selectedRouting.operations}
              selectedStepId={selectedStep?.id}
              onStepClick={handleStepClick}
            />

            {/* B. 공정 상세 */}
            <StepDetail selectedStep={selectedStep} onSave={handleSaveStep} />
          </>
        ) : (
          <EmptyState>Select a routing to view process flow</EmptyState>
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
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
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

const FlowSection = styled.div`
  padding: 20px 30px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
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
  min-width: max-content;
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
        : props.$type === "TEST"
          ? "#fff3e0"
          : "#e8f5e9"};
  color: ${(props) =>
    props.$type === "CLEAN"
      ? "#1976d2"
      : props.$type === "INSPECT"
        ? "#7b1fa2"
        : props.$type === "TEST"
          ? "#e67e22"
          : "#2e7d32"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 2px solid ${(props) => (props.$active ? "#1a4f8b" : "transparent")};
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
  margin-bottom: 25px;
`;

const DetailSection = styled.div`
  flex: 1;
  background: #f5f6fa;
  padding: 20px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
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
const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
`;
