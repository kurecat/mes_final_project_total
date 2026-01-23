// src/pages/resource/WorkerPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
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

const API_BASE = "/api/mes";

// ===== 공통 유틸: authority ROLE_ 보정 =====
const normalizeAuthority = (value) => {
  let auth = value ?? "ROLE_OPERATOR";
  auth = String(auth).trim().toUpperCase();
  if (!auth.startsWith("ROLE_")) auth = "ROLE_" + auth;
  return auth;
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Stats Component
const WorkerStats = React.memo(({ total, onDuty, engineers }) => {
  return (
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
  );
});

// 2. Header & Control Component
const WorkerHeader = React.memo(
  ({
    loading,
    onAdd,
    filterRole,
    onFilterChange,
    searchTerm,
    onSearchChange,
  }) => {
    return (
      <>
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
            <AddButton onClick={onAdd}>
              <FaPlus /> Register Worker
            </AddButton>
          </ActionGroup>
        </Header>

        <ControlBar>
          <FilterGroup>
            {["ALL", "ROLE_ADMIN", "ROLE_OPERATOR"].map((role) => (
              <FilterBtn
                key={role}
                $active={filterRole === role}
                onClick={() => onFilterChange(role)}
              >
                {role === "ALL" ? "All" : role}
              </FilterBtn>
            ))}
          </FilterGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Name or Dept..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
        </ControlBar>
      </>
    );
  },
);

// 3. Worker Card Item Component
const WorkerCardItem = React.memo(({ worker, onEdit, onDelete }) => {
  const workerPk = worker.id ?? worker.workerId; // ✅ 둘다 대응

  return (
    <WorkerCard $status={worker.status}>
      <CardHeader>
        <ProfileSection>
          <Avatar>{(worker.name ?? "W").charAt(0)}</Avatar>
          <NameInfo>
            <Name>{worker.name}</Name>
            <Role>
              {worker.authority} | {worker.dept}
            </Role>
          </NameInfo>
        </ProfileSection>
        <StatusBadge $status={worker.status}>{worker.status}</StatusBadge>
      </CardHeader>

      <CardBody>
        <InfoRow>
          <FaIdBadge color="#aaa" /> <span>ID: {workerPk ?? "-"}</span>
        </InfoRow>
        <InfoRow>
          <FaClock color="#aaa" /> <span>Shift: {worker.shift}</span>
        </InfoRow>

        <CertiSection>
          <CertiTitle>
            <FaCertificate size={10} /> Certifications (Skill)
          </CertiTitle>
          <TagWrapper>
            {(worker.certifications ?? []).map((cert, idx) => (
              <CertTag key={idx}>{cert}</CertTag>
            ))}
          </TagWrapper>
        </CertiSection>
      </CardBody>

      <CardFooter>
        <JoinDate>Joined: {worker.joinDate ?? "-"}</JoinDate>
        <ActionArea>
          <IconBtn className="edit" onClick={() => onEdit(worker)}>
            <FaEdit />
          </IconBtn>
          <IconBtn className="del" onClick={() => onDelete(workerPk)}>
            <FaTrash />
          </IconBtn>
        </ActionArea>
      </CardFooter>
    </WorkerCard>
  );
});

// 4. Modal Component
const WorkerModal = React.memo(
  ({ isOpen, onClose, editForm, setEditForm, onSave, target }) => {
    if (!isOpen) return null;

    return (
      <ModalOverlay onClick={onClose}>
        <ModalBox onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Worker Edit</ModalTitle>

          <ModalRow>
            <ModalLabel>Name</ModalLabel>
            <ModalInput
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </ModalRow>

          <ModalRow>
            <ModalLabel>Role(Authority)</ModalLabel>
            <ModalSelect
              value={editForm.authority}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  authority: normalizeAuthority(e.target.value),
                }))
              }
            >
              {/* ✅ 백엔드 enum에 맞게 수정 */}
              <option value="ROLE_OPERATOR">ROLE_OPERATOR</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            </ModalSelect>
          </ModalRow>

          <ModalRow>
            <ModalLabel>Dept</ModalLabel>
            <ModalInput
              value={editForm.dept}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, dept: e.target.value }))
              }
            />
          </ModalRow>

          <ModalRow>
            <ModalLabel>Shift</ModalLabel>
            <ModalSelect
              value={editForm.shift}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, shift: e.target.value }))
              }
            >
              <option value="Day">Day</option>
              <option value="Swing">Swing</option>
              <option value="Night">Night</option>
            </ModalSelect>
          </ModalRow>

          <ModalRow>
            <ModalLabel>Status</ModalLabel>
            <ModalSelect
              value={editForm.status}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="WORKING">WORKING</option>
              <option value="OFF">OFF</option>
              <option value="BREAK">BREAK</option>
            </ModalSelect>
          </ModalRow>

          <ModalRow>
            <ModalLabel>Join Date</ModalLabel>
            <ModalReadonly>{target?.joinDate ?? "-"}</ModalReadonly>
          </ModalRow>

          <ModalRow>
            <ModalLabel>Certifications</ModalLabel>
            <ModalTextarea
              placeholder="ex) Basic Safety, ASML Scanner"
              value={editForm.certificationsText}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  certificationsText: e.target.value,
                }))
              }
            />
          </ModalRow>

          <ModalFooter>
            <ModalBtn className="cancel" onClick={onClose}>
              Cancel
            </ModalBtn>
            <ModalBtn className="save" onClick={onSave}>
              Save
            </ModalBtn>
          </ModalFooter>
        </ModalBox>
      </ModalOverlay>
    );
  },
);

// --- Main Component ---

const WorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 수정 모달
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    authority: "ROLE_OPERATOR",
    dept: "",
    shift: "Day",
    status: "OFF",
    certificationsText: "",
  });

  // 1) 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_BASE}/worker/list`);
      setWorkers(res.data ?? []);
    } catch (err) {
      console.error("작업자 조회 실패:", err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2) 삭제 (DELETE) - useCallback
  const handleDelete = useCallback(async (workerPk) => {
    if (!workerPk) return;
    if (!window.confirm("해당 작업자를 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`${API_BASE}/worker/${workerPk}`);

      setWorkers((prev) =>
        prev.filter((w) => (w.id ?? w.workerId) !== workerPk),
      );

      alert("삭제 완료");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패 (콘솔 확인)");
    }
  }, []);

  // 3) 추가 (CREATE) - useCallback
  const handleAdd = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await axiosInstance.post(`${API_BASE}/worker/register`, {
        email: `worker${Date.now()}@test.com`,
        password: "1234",
        name: "New Worker",
        authority: "ROLE_OPERATOR", // ✅ enum과 동일하게
        dept: "TBD",
        shift: "Day",
        status: "OFF",
        joinDate: today,
        certifications: ["Basic Safety"],
      });

      setWorkers((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("작업자 등록 실패:", err);
      alert("작업자 등록 실패 (콘솔 확인)");
    }
  }, []);

  // 4) 수정 모달 열기 - useCallback
  const openEditModal = useCallback((worker) => {
    setEditTarget(worker);

    const auth = normalizeAuthority(worker.authority);

    setEditForm({
      name: worker.name ?? "",
      authority: auth,
      dept: worker.dept ?? "",
      shift: worker.shift ?? "Day",
      status: worker.status ?? "OFF",
      certificationsText: (worker.certifications ?? []).join(", "),
    });

    setEditOpen(true);
  }, []);

  // 5) 수정 저장 (UPDATE) - useCallback
  const handleSaveEdit = useCallback(async () => {
    const workerPk = editTarget?.id ?? editTarget?.workerId; // ✅ 핵심
    if (!workerPk) {
      console.error("수정 실패: workerPk(id/workerId)가 없음", editTarget);
      alert("수정 실패: worker id가 없습니다.");
      return;
    }

    try {
      const certList = (editForm.certificationsText || "")
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const payload = {
        name: editForm.name,
        authority: normalizeAuthority(editForm.authority),
        dept: editForm.dept,
        shift: editForm.shift,
        status: editForm.status,
        certifications: certList,
      };

      console.log("PATCH workerPk =", workerPk);
      console.log("PATCH payload =", payload);

      const res = await axiosInstance.patch(
        `${API_BASE}/worker/${workerPk}`,
        payload,
      );

      const updatedWorker = res.data;

      setWorkers((prev) =>
        prev.map((w) => {
          const wPk = w.id ?? w.workerId;
          return wPk === workerPk ? updatedWorker : w;
        }),
      );

      setEditOpen(false);
      setEditTarget(null);
      alert("수정 완료");
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 실패 (콘솔 확인)");
    }
  }, [editForm, editTarget]);

  const handleFilterChange = useCallback((role) => {
    setFilterRole(role);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditOpen(false);
  }, []);

  // 필터링 - useMemo
  const filteredList = useMemo(() => {
    return workers.filter((w) => {
      const auth = normalizeAuthority(w.authority);

      const matchRole = filterRole === "ALL" || auth === filterRole;
      const matchSearch =
        (w.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.dept ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      return matchRole && matchSearch;
    });
  }, [workers, filterRole, searchTerm]);

  // KPI 계산 - useMemo
  const stats = useMemo(() => {
    return {
      total: workers.length,
      onDuty: workers.filter((w) => w.status === "WORKING").length,
      // ✅ ROLE_ADMIN을 엔지니어처럼 보여주고 싶으면 이렇게
      engineers: workers.filter(
        (w) => normalizeAuthority(w.authority) === "ROLE_ADMIN",
      ).length,
    };
  }, [workers]);

  return (
    <Container>
      <WorkerHeader
        loading={loading}
        onAdd={handleAdd}
        filterRole={filterRole}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <WorkerStats
        total={stats.total}
        onDuty={stats.onDuty}
        engineers={stats.engineers}
      />

      <GridContainer>
        {filteredList.map((worker) => (
          <WorkerCardItem
            key={worker.id ?? worker.workerId}
            worker={worker}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
      </GridContainer>

      <WorkerModal
        isOpen={editOpen}
        onClose={handleCloseModal}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        target={editTarget}
      />
    </Container>
  );
};

export default WorkerPage;

// --- Styled Components (No Changes) ---

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

/* ===== Modal ===== */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  width: 520px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 14px 0;
  font-size: 18px;
  font-weight: 800;
  color: #333;
`;

const ModalRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const ModalLabel = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 700;
`;

const ModalInput = styled.input`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  outline: none;
`;

const ModalSelect = styled.select`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  background: white;
`;

const ModalTextarea = styled.textarea`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  min-height: 70px;
  resize: vertical;
`;

const ModalReadonly = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background: #f9f9f9;
  color: #555;
  font-size: 13px;
`;

const ModalFooter = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ModalBtn = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;

  &.cancel {
    background: #eee;
    color: #555;
  }
  &.save {
    background: #1a4f8b;
    color: white;
  }
`;
