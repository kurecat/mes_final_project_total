// src/pages/production/WorkerPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaUserFriends,
  FaUserClock,
  FaUserTie,
  FaSearch,
  FaFilter,
  FaExchangeAlt,
  FaHardHat,
  FaStar,
  FaCircle,
} from "react-icons/fa";

// --- Mock Data ---
// 작업자 리스트
const WORKER_DATA = [
  {
    id: "OP-001",
    name: "Kim Min-Su",
    role: "Operator",
    skill: "Master",
    status: "WORKING",
    line: "LINE-A",
    shift: "Day",
  },
  {
    id: "OP-002",
    name: "Lee Ji-Hyun",
    role: "Operator",
    skill: "Senior",
    status: "WORKING",
    line: "LINE-A",
    shift: "Day",
  },
  {
    id: "OP-003",
    name: "Park Dong-Hoon",
    role: "Lead",
    skill: "Master",
    status: "WORKING",
    line: "LINE-B",
    shift: "Day",
  },
  {
    id: "OP-004",
    name: "Choi Soo-Young",
    role: "Operator",
    skill: "Junior",
    status: "BREAK",
    line: "LINE-B",
    shift: "Day",
  },
  {
    id: "OP-005",
    name: "Jung Jae-Min",
    role: "Operator",
    skill: "Senior",
    status: "WORKING",
    line: "LINE-C",
    shift: "Day",
  },
  {
    id: "OP-006",
    name: "Han Ye-Seul",
    role: "Operator",
    skill: "Junior",
    status: "WAITING",
    line: null,
    shift: "Day",
  }, // 대기중
  {
    id: "OP-007",
    name: "Kang Ho-Dong",
    role: "Operator",
    skill: "Senior",
    status: "ABSENT",
    line: null,
    shift: "Day",
  }, // 결근
  {
    id: "OP-008",
    name: "Yoo Jae-Suk",
    role: "Manager",
    skill: "Master",
    status: "MEETING",
    line: null,
    shift: "Day",
  },
];

// 라인 정보 (Drop Zone 역할)
const LINES = [
  { id: "LINE-A", name: "Line-A (Stacking)", required: 3, current: 2 },
  { id: "LINE-B", name: "Line-B (Pkg/Reflow)", required: 4, current: 2 },
  { id: "LINE-C", name: "Line-C (Test)", required: 2, current: 1 },
];

const WorkerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedWorker, setDraggedWorker] = useState(null); // (DnD 시뮬레이션용)

  // 필터링
  const filteredWorkers = WORKER_DATA.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 그룹화: 라인별 작업자, 대기 작업자
  const assignedWorkers = {};
  LINES.forEach((line) => {
    assignedWorkers[line.id] = filteredWorkers.filter(
      (w) => w.line === line.id
    );
  });
  const unassignedWorkers = filteredWorkers.filter((w) => !w.line);

  // 스킬별 별점 렌더링
  const renderStars = (skill) => {
    const count = skill === "Master" ? 3 : skill === "Senior" ? 2 : 1;
    return (
      <SkillStars>
        {[...Array(count)].map((_, i) => (
          <FaStar key={i} size={10} color="#f1c40f" />
        ))}
        <span style={{ marginLeft: 3, fontSize: 11, color: "#666" }}>
          {skill}
        </span>
      </SkillStars>
    );
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case "WORKING":
        return "#2ecc71";
      case "BREAK":
        return "#f39c12";
      case "WAITING":
        return "#3498db";
      case "ABSENT":
        return "#e74c3c";
      case "MEETING":
        return "#9b59b6";
      default:
        return "#95a5a6";
    }
  };

  return (
    <Container>
      {/* 1. 상단 통계 카드 */}
      <StatsRow>
        <StatCard>
          <IconBox $color="#1a4f8b">
            <FaUserFriends />
          </IconBox>
          <StatInfo>
            <StatLabel>Total Workers</StatLabel>
            <StatValue>{WORKER_DATA.length}</StatValue>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#2ecc71">
            <FaUserClock />
          </IconBox>
          <StatInfo>
            <StatLabel>Working Now</StatLabel>
            <StatValue>
              {WORKER_DATA.filter((w) => w.status === "WORKING").length}
            </StatValue>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#f39c12">
            <FaExchangeAlt />
          </IconBox>
          <StatInfo>
            <StatLabel>Shift Type</StatLabel>
            <StatValue style={{ fontSize: 20 }}>Day Shift (A)</StatValue>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#e74c3c">
            <FaUserTie />
          </IconBox>
          <StatInfo>
            <StatLabel>Absence</StatLabel>
            <StatValue>
              {WORKER_DATA.filter((w) => w.status === "ABSENT").length}
            </StatValue>
          </StatInfo>
        </StatCard>
      </StatsRow>

      <ContentArea>
        {/* 2. 좌측: 대기 인원 풀 (Unassigned Pool) */}
        <PoolSection>
          <SectionHeader>
            <Title>Waiting / Unassigned Pool</Title>
            <SearchBox>
              <FaSearch color="#aaa" />
              <input
                placeholder="Search Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
          </SectionHeader>

          <WorkerGrid>
            {unassignedWorkers.map((worker) => (
              <WorkerCard key={worker.id} $status={worker.status}>
                <CardTop>
                  <Avatar>
                    <FaHardHat />
                  </Avatar>
                  <Info>
                    <Name>{worker.name}</Name>
                    <Role>{worker.role}</Role>
                  </Info>
                  <StatusDot color={getStatusColor(worker.status)} />
                </CardTop>
                <CardBottom>
                  {renderStars(worker.skill)}
                  <StatusBadge $color={getStatusColor(worker.status)}>
                    {worker.status}
                  </StatusBadge>
                </CardBottom>
              </WorkerCard>
            ))}
          </WorkerGrid>
        </PoolSection>

        {/* 3. 우측: 라인별 배치 현황 (Line Assignment) */}
        <LineSection>
          <SectionHeader>
            <Title>Line Assignment Status</Title>
            <FilterBtn>
              <FaFilter /> Filter
            </FilterBtn>
          </SectionHeader>

          <LineContainer>
            {LINES.map((line) => (
              <LineBox key={line.id}>
                <LineHeader>
                  <LineName>{line.name}</LineName>
                  <HeadCount>
                    Manpower:{" "}
                    <strong
                      style={{
                        color:
                          assignedWorkers[line.id].length < line.required
                            ? "#e74c3c"
                            : "#2ecc71",
                      }}
                    >
                      {assignedWorkers[line.id].length}
                    </strong>{" "}
                    / {line.required}
                  </HeadCount>
                </LineHeader>

                <LineBody>
                  {assignedWorkers[line.id].length > 0 ? (
                    assignedWorkers[line.id].map((worker) => (
                      <CompactWorkerCard
                        key={worker.id}
                        $status={worker.status}
                      >
                        <CompactAvatar>
                          <FaHardHat />
                        </CompactAvatar>
                        <CompactInfo>
                          <CompactName>{worker.name}</CompactName>
                          <CompactMeta>
                            {worker.skill} • {worker.role}
                          </CompactMeta>
                        </CompactInfo>
                        <StatusIndicator
                          $color={getStatusColor(worker.status)}
                        />
                      </CompactWorkerCard>
                    ))
                  ) : (
                    <EmptyState>No workers assigned</EmptyState>
                  )}
                  {/* 빈 슬롯 표시 (채워야 할 인원만큼) */}
                  {[
                    ...Array(
                      Math.max(
                        0,
                        line.required - assignedWorkers[line.id].length
                      )
                    ),
                  ].map((_, i) => (
                    <EmptySlot key={i}>+ Assign</EmptySlot>
                  ))}
                </LineBody>
              </LineBox>
            ))}
          </LineContainer>
        </LineSection>
      </ContentArea>
    </Container>
  );
};

export default WorkerPage;

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

// Stats Section
const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconBox = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${(props) => `${props.$color}15`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

// Main Content
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
`;

// Left: Pool
const PoolSection = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    width: 120px;
    font-size: 13px;
  }
`;

const WorkerGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
  align-content: start;
`;

// Worker Card (Pool)
const WorkerCard = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: grab;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    border-color: #1a4f8b;
    transform: translateY(-2px);
  }
  &:active {
    cursor: grabbing;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e3f2fd;
  color: #1a4f8b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Role = styled.div`
  font-size: 11px;
  color: #888;
`;

const StatusDot = styled(FaCircle)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 8px;
  color: ${(props) => props.color};
`;

const CardBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
`;

const SkillStars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${(props) => `${props.$color}20`};
  color: ${(props) => props.$color};
  font-weight: 600;
`;

// Right: Lines
const LineSection = styled.div`
  flex: 2;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const FilterBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: white;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background: #f5f5f5;
  }
`;

const LineContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LineBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
`;

const LineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const LineName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1a4f8b;
`;

const HeadCount = styled.div`
  font-size: 13px;
  color: #555;
`;

const LineBody = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

// Compact Card (In Line)
const CompactWorkerCard = styled.div`
  background: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 3px solid
    ${(props) => (props.$status === "WORKING" ? "#2ecc71" : "#f39c12")};
`;

const CompactAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
`;

const CompactInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CompactName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const CompactMeta = styled.div`
  font-size: 11px;
  color: #888;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
`;

const EmptyState = styled.div`
  color: #aaa;
  font-size: 13px;
  padding: 10px;
`;

const EmptySlot = styled.div`
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 13px;
  height: 50px;
  cursor: pointer;
  background-color: white;

  &:hover {
    border-color: #1a4f8b;
    color: #1a4f8b;
    background-color: #e3f2fd;
  }
`;
