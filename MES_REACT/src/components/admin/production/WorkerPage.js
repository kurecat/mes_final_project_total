// src/pages/resource/WorkerPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaUserTie,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaIdBadge,
  FaCertificate,
  FaBriefcase,
  FaClock,
  FaSync,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_WORKERS = [
  {
    id: "24001",
    name: "Kim Min-su",
    role: "Engineer",
    dept: "Photo",
    shift: "Day",
    status: "WORKING",
    certifications: ["ASML Scanner", "Track System"],
    joinDate: "2020-03-01",
  },
  {
    id: "24002",
    name: "Lee Ji-eun",
    role: "Operator",
    dept: "Etch",
    shift: "Swing",
    status: "OFF",
    certifications: ["Lam Etcher"],
    joinDate: "2021-06-15",
  },
  {
    id: "24003",
    name: "Park Dong-hoon",
    role: "Manager",
    dept: "Fab-Common",
    shift: "Day",
    status: "WORKING",
    certifications: ["Safety Lv.1", "Process Mgmt"],
    joinDate: "2018-01-10",
  },
  {
    id: "24004",
    name: "Choi Yu-jin",
    role: "Engineer",
    dept: "EDS",
    shift: "Night",
    status: "BREAK",
    certifications: ["Advantest Tester", "Probe Card"],
    joinDate: "2022-11-20",
  },
];

const WorkerPage = () => {
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 데이터 조회 (READ)
  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API: http://localhost:3001/workers
      // const res = await axios.get("http://localhost:3001/workers");
      // setWorkers(res.data);

      setTimeout(() => {
        setWorkers(MOCK_WORKERS);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. 삭제 (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm("해당 작업자를 삭제하시겠습니까?")) return;
    try {
      // await axios.delete(`http://localhost:3001/workers/${id}`);
      setWorkers((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 3. 추가 (CREATE - Mock)
  const handleAdd = () => {
    const newWorker = {
      id: `2400${Math.floor(Math.random() * 9)}`,
      name: "New Worker",
      role: "Operator",
      dept: "TBD",
      shift: "Day",
      status: "OFF",
      certifications: ["Basic Safety"],
      joinDate: new Date().toISOString().split("T")[0],
    };
    setWorkers([newWorker, ...workers]);
  };

  // 필터링
  const filteredList = workers.filter((w) => {
    const matchRole = filterRole === "ALL" || w.role === filterRole;
    const matchSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.dept.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  // KPI 계산
  const total = workers.length;
  const onDuty = workers.filter((w) => w.status === "WORKING").length;
  const engineers = workers.filter((w) => w.role === "Engineer").length;

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaUserTie /> Worker Management
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Fab Operators & Engineers Certification Status</SubTitle>
        </TitleArea>
        <ActionGroup>
          <AddButton onClick={handleAdd}>
            <FaPlus /> Register Worker
          </AddButton>
        </ActionGroup>
      </Header>

      {/* KPI 카드 */}
      <StatsGrid>
        <StatCard>
          <IconBox $color="#1a4f8b">
            <FaUserTie />
          </IconBox>
          <StatInfo>
            <Label>Total Personnel</Label>
            <Value>{total}</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#2ecc71">
            <FaBriefcase />
          </IconBox>
          <StatInfo>
            <Label>On-Duty (Working)</Label>
            <Value>{onDuty}</Value>
          </StatInfo>
        </StatCard>
        <StatCard>
          <IconBox $color="#e67e22">
            <FaCertificate />
          </IconBox>
          <StatInfo>
            <Label>Certified Engineers</Label>
            <Value>{engineers}</Value>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* 컨트롤 바 */}
      <ControlBar>
        <FilterGroup>
          <FilterBtn
            $active={filterRole === "ALL"}
            onClick={() => setFilterRole("ALL")}
          >
            All
          </FilterBtn>
          <FilterBtn
            $active={filterRole === "Engineer"}
            onClick={() => setFilterRole("Engineer")}
          >
            Engineers
          </FilterBtn>
          <FilterBtn
            $active={filterRole === "Operator"}
            onClick={() => setFilterRole("Operator")}
          >
            Operators
          </FilterBtn>
          <FilterBtn
            $active={filterRole === "Manager"}
            onClick={() => setFilterRole("Manager")}
          >
            Managers
          </FilterBtn>
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Name or Dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </ControlBar>

      {/* 작업자 카드 그리드 */}
      <GridContainer>
        {filteredList.map((worker) => (
          <WorkerCard key={worker.id} $status={worker.status}>
            <CardHeader>
              <ProfileSection>
                <Avatar>{worker.name.charAt(0)}</Avatar>
                <NameInfo>
                  <Name>{worker.name}</Name>
                  <Role>
                    {worker.role} | {worker.dept}
                  </Role>
                </NameInfo>
              </ProfileSection>
              <StatusBadge $status={worker.status}>{worker.status}</StatusBadge>
            </CardHeader>

            <CardBody>
              <InfoRow>
                <FaIdBadge color="#aaa" /> <span>ID: {worker.id}</span>
              </InfoRow>
              <InfoRow>
                <FaClock color="#aaa" /> <span>Shift: {worker.shift}</span>
              </InfoRow>

              <CertiSection>
                <CertiTitle>
                  <FaCertificate size={10} /> Certifications (Skill)
                </CertiTitle>
                <TagWrapper>
                  {worker.certifications.map((cert, idx) => (
                    <CertTag key={idx}>{cert}</CertTag>
                  ))}
                </TagWrapper>
              </CertiSection>
            </CardBody>

            <CardFooter>
              <JoinDate>Joined: {worker.joinDate}</JoinDate>
              <ActionArea>
                <IconBtn className="edit">
                  <FaEdit />
                </IconBtn>
                <IconBtn
                  className="del"
                  onClick={() => handleDelete(worker.id)}
                >
                  <FaTrash />
                </IconBtn>
              </ActionArea>
            </CardFooter>
          </WorkerCard>
        ))}
      </GridContainer>
    </Container>
  );
};

export default WorkerPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  .spin {
    animation: spin 1s linear infinite;
    color: #aaa;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const AddButton = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;
const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
const Label = styled.span`
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
`;
const Value = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #333;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const FilterBtn = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$active ? "#1a4f8b" : "#eee")};
  background: ${(props) => (props.$active ? "#1a4f8b" : "#f9f9f9")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  &:hover {
    background: ${(props) => (props.$active ? "#133b6b" : "#eee")};
  }
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 200px;
    font-size: 14px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
`;

const WorkerCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 4px solid
    ${(props) =>
      props.$status === "WORKING"
        ? "#2ecc71"
        : props.$status === "BREAK"
        ? "#f39c12"
        : "#ccc"};
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f0f0f0;
`;
const ProfileSection = styled.div`
  display: flex;
  gap: 12px;
`;
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a4f8b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
`;
const NameInfo = styled.div`
  display: flex;
  flex-direction: column;
`;
const Name = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #333;
`;
const Role = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(props) =>
    props.$status === "WORKING"
      ? "#e8f5e9"
      : props.$status === "BREAK"
      ? "#fff3e0"
      : "#eee"};
  color: ${(props) =>
    props.$status === "WORKING"
      ? "#2e7d32"
      : props.$status === "BREAK"
      ? "#e67e22"
      : "#888"};
`;

const CardBody = styled.div`
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
`;

const CertiSection = styled.div`
  margin-top: 10px;
`;
const CertiTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #1a4f8b;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;
const TagWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;
const CertTag = styled.span`
  background: #f0f4f8;
  border: 1px solid #e1e4e8;
  color: #666;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
`;

const CardFooter = styled.div`
  padding: 10px 15px;
  background: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const JoinDate = styled.div`
  font-size: 11px;
  color: #999;
`;
const ActionArea = styled.div`
  display: flex;
  gap: 5px;
`;
const IconBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #eee;
  }
  &.edit:hover {
    color: #1a4f8b;
  }
  &.del:hover {
    color: #e74c3c;
  }
`;
