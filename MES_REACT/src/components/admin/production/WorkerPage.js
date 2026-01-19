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
  FaSave,
  FaTimes,
} from "react-icons/fa";

// =============================
// Dummy Worker Data
// =============================
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
    certifications: ["Dry Etcher", "PM Level-1"],
    joinDate: "2021-07-15",
  },
  {
    id: "24003",
    name: "Park Joon-ho",
    role: "Technician",
    dept: "CMP",
    shift: "Night",
    status: "WORKING",
    certifications: ["CMP Tool", "Chemical Handling"],
    joinDate: "2019-11-20",
  },
];

// =============================
// (추후 백엔드 붙일 때 사용)
// =============================
// const API_BASE = "http://localhost:8111/api/mes";

const WorkerPage = () => {
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterShift, setFilterShift] = useState("ALL");

  // =============================
  // 수정 상태
  // =============================
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    role: "",
    dept: "",
    shift: "",
    status: "",
    certifications: "",
    joinDate: "",
  });

  // =============================
  // 데이터 조회 (Mock)
  // =============================
  const fetchData = async () => {
    setLoading(true);
    try {
      // 추후 API 연결:
      // const res = await axios.get(`${API_BASE}/workers`);
      // setWorkers(res.data);

      setTimeout(() => {
        setWorkers(MOCK_WORKERS);
        setLoading(false);
      }, 400);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =============================
  // 추가 (Mock)
  // =============================
  const handleAddWorker = () => {
    const newWorker = {
      id: String(Math.floor(Math.random() * 90000) + 10000),
      name: "New Worker",
      role: "Operator",
      dept: "Fab",
      shift: "Day",
      status: "OFF",
      certifications: ["New Cert"],
      joinDate: new Date().toISOString().split("T")[0],
    };

    setWorkers((prev) => [newWorker, ...prev]);
    alert("작업자가 추가되었습니다. (Mock)");
  };

  // =============================
  // 삭제 (Mock)
  // =============================
  const handleDeleteWorker = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  // =============================
  // 수정 시작
  // =============================
  const handleEditStart = (worker) => {
    setEditingId(worker.id);
    setEditForm({
      id: worker.id ?? "",
      name: worker.name ?? "",
      role: worker.role ?? "",
      dept: worker.dept ?? "",
      shift: worker.shift ?? "",
      status: worker.status ?? "",
      certifications: (worker.certifications ?? []).join(", "),
      joinDate: worker.joinDate ?? "",
    });
  };

  // =============================
  // 수정 취소
  // =============================
  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({
      id: "",
      name: "",
      role: "",
      dept: "",
      shift: "",
      status: "",
      certifications: "",
      joinDate: "",
    });
  };

  // =============================
  // 수정 저장 (Mock)
  // =============================
  const handleEditSave = () => {
    if (!editForm.name.trim()) {
      alert("이름을 입력하세요.");
      return;
    }

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === editingId
          ? {
              ...w,
              name: editForm.name.trim(),
              role: editForm.role.trim(),
              dept: editForm.dept.trim(),
              shift: editForm.shift.trim(),
              status: editForm.status.trim(),
              joinDate: editForm.joinDate,
              certifications: editForm.certifications
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
            }
          : w
      )
    );

    alert("수정이 저장되었습니다. (Mock)");
    setEditingId(null);
  };

  // =============================
  // 필터링 + 검색
  // =============================
  const filteredWorkers = workers.filter((w) => {
    const matchDept = filterDept === "ALL" || w.dept === filterDept;
    const matchShift = filterShift === "ALL" || w.shift === filterShift;

    const keyword = (searchTerm ?? "").toLowerCase();
    const id = (w.id ?? "").toLowerCase();
    const name = (w.name ?? "").toLowerCase();
    const role = (w.role ?? "").toLowerCase();

    const matchSearch =
      id.includes(keyword) || name.includes(keyword) || role.includes(keyword);

    return matchDept && matchShift && matchSearch;
  });

  return (
    <Container>
      {/* Header */}
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
          <SubTitle>Fab / EDS / Module Worker & Skill Registry</SubTitle>
        </TitleArea>

        <ActionGroup>
          <AddButton onClick={handleAddWorker}>
            <FaPlus /> Add Worker
          </AddButton>
        </ActionGroup>
      </Header>

      {/* Controls */}
      <ControlBar>
        <FilterGroup>
          <Select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="ALL">All Depts</option>
            <option value="Fab">Fab</option>
            <option value="Photo">Photo</option>
            <option value="Etch">Etch</option>
            <option value="CMP">CMP</option>
          </Select>

          <Select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
          >
            <option value="ALL">All Shifts</option>
            <option value="Day">Day</option>
            <option value="Swing">Swing</option>
            <option value="Night">Night</option>
          </Select>
        </FilterGroup>

        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search ID / Name / Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </ControlBar>

      {/* Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Dept</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Certifications</th>
              <th>Join Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkers.map((w) => {
              const isEditing = editingId === w.id;

              return (
                <tr key={w.id}>
                  <td style={{ fontWeight: 700, color: "#1a4f8b" }}>
                    <FaIdBadge style={{ marginRight: 6 }} />
                    {w.id}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditInput
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      w.name
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditInput
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <>
                        <FaBriefcase style={{ marginRight: 6 }} />
                        {w.role}
                      </>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditInput
                        value={editForm.dept}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            dept: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      w.dept
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditInput
                        value={editForm.shift}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            shift: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <>
                        <FaClock style={{ marginRight: 6 }} />
                        {w.shift}
                      </>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditSelect
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        <option value="WORKING">WORKING</option>
                        <option value="OFF">OFF</option>
                        <option value="TRAINING">TRAINING</option>
                      </EditSelect>
                    ) : (
                      <StatusBadge $status={w.status}>{w.status}</StatusBadge>
                    )}
                  </td>

                  <td style={{ fontSize: 12 }}>
                    {isEditing ? (
                      <EditInput
                        value={editForm.certifications}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            certifications: e.target.value,
                          }))
                        }
                        placeholder="ex) ASML Scanner, Track System"
                      />
                    ) : (
                      <>
                        <FaCertificate style={{ marginRight: 6 }} />
                        {(w.certifications ?? []).join(", ")}
                      </>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <EditInput
                        type="date"
                        value={editForm.joinDate}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            joinDate: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      w.joinDate
                    )}
                  </td>

                  <td>
                    <ActionButtons>
                      {!isEditing ? (
                        <>
                          <IconBtn
                            className="edit"
                            onClick={() => handleEditStart(w)}
                            title="Edit"
                          >
                            <FaEdit />
                          </IconBtn>
                          <IconBtn
                            className="del"
                            onClick={() => handleDeleteWorker(w.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </IconBtn>
                        </>
                      ) : (
                        <>
                          <IconBtn
                            className="save"
                            onClick={handleEditSave}
                            title="Save"
                          >
                            <FaSave />
                          </IconBtn>
                          <IconBtn
                            className="cancel"
                            onClick={handleEditCancel}
                            title="Cancel"
                          >
                            <FaTimes />
                          </IconBtn>
                        </>
                      )}
                    </ActionButtons>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default WorkerPage;

// =============================
// Styled Components
// =============================
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
  margin-left: 32px;
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
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 13px;
  color: #555;
  background: #fff;
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
    width: 220px;
    font-size: 14px;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    th {
      text-align: left;
      padding: 12px;
      background: #f9f9f9;
      color: #666;
      border-bottom: 2px solid #eee;
      font-weight: 700;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;

      &:hover {
        background: #f8fbff;
      }
    }

    td {
      padding: 12px;
      color: #333;
      vertical-align: middle;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "WORKING"
      ? "#e8f5e9"
      : props.$status === "TRAINING"
      ? "#e3f2fd"
      : "#fff3e0"};
  color: ${(props) =>
    props.$status === "WORKING"
      ? "#2e7d32"
      : props.$status === "TRAINING"
      ? "#1976d2"
      : "#e67e22"};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconBtn = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #f5f5f5;
  }

  &.edit:hover {
    color: #1a4f8b;
    border-color: #1a4f8b;
  }

  &.del:hover {
    color: #e74c3c;
    border-color: #e74c3c;
  }

  &.save:hover {
    color: #2e7d32;
    border-color: #2e7d32;
  }

  &.cancel:hover {
    color: #555;
    border-color: #999;
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  background: #fff;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const EditSelect = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  background: #fff;

  &:focus {
    border-color: #1a4f8b;
  }
`;
