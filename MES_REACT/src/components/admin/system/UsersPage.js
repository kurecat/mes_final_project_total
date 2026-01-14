// src/pages/system/UsersPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaUser,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUnlockAlt,
  FaFilter,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaSave,
} from "react-icons/fa";

// --- Mock Data ---
const USER_LIST = [
  {
    id: "2024001",
    name: "Kim Min-Su",
    dept: "Production A",
    role: "ROLE_OPERATOR",
    email: "ms.kim@hbm.com",
    phone: "010-1234-5678",
    status: "ACTIVE",
    lastLogin: "2024-05-20 14:00",
  },
  {
    id: "2023045",
    name: "Lee Ji-Hyun",
    dept: "Quality Control",
    role: "ROLE_QUALITY",
    email: "jh.lee@hbm.com",
    phone: "010-2222-3333",
    status: "ACTIVE",
    lastLogin: "2024-05-20 09:30",
  },
  {
    id: "2022010",
    name: "Park Dong-Hoon",
    dept: "Production Manage",
    role: "ROLE_MANAGER",
    email: "dh.park@hbm.com",
    phone: "010-4444-5555",
    status: "ACTIVE",
    lastLogin: "2024-05-20 13:15",
  },
  {
    id: "2021099",
    name: "Choi Soo-Young",
    dept: "System Team",
    role: "ROLE_ADMIN",
    email: "sy.choi@hbm.com",
    phone: "010-9999-8888",
    status: "ACTIVE",
    lastLogin: "2024-05-19 18:00",
  },
  {
    id: "2024050",
    name: "New Employee",
    dept: "Production B",
    role: "ROLE_OPERATOR",
    email: "new@hbm.com",
    phone: "010-0000-0000",
    status: "INACTIVE",
    lastLogin: "-",
  },
];

const UsersPage = () => {
  const [users, setUsers] = useState(USER_LIST);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
  const [currentUser, setCurrentUser] = useState(null);

  // 필터링
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm);
    const matchRole = filterRole === "ALL" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  // 모달 열기
  const openModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === "EDIT" && user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({
        id: "",
        name: "",
        dept: "",
        role: "ROLE_OPERATOR",
        email: "",
        phone: "",
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  // 저장 핸들러
  const handleSave = () => {
    if (modalMode === "ADD") {
      setUsers([...users, { ...currentUser, lastLogin: "-" }]);
    } else {
      setUsers(users.map((u) => (u.id === currentUser.id ? currentUser : u)));
    }
    setIsModalOpen(false);
  };

  // 비밀번호 초기화 핸들러
  const handleResetPw = (name) => {
    if (window.confirm(`Reset password for [${name}]?`)) {
      alert("Password has been reset to default (1234).");
    }
  };

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  return (
    <Container>
      {/* 1. 헤더 및 컨트롤 바 */}
      <HeaderSection>
        <TitleArea>
          <PageTitle>
            <FaUser /> User Management
          </PageTitle>
          <SubTitle>시스템 사용자 계정 및 권한 관리</SubTitle>
        </TitleArea>
        <ControlBar>
          <FilterGroup>
            <FilterIcon>
              <FaFilter />
            </FilterIcon>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_MANAGER">Manager</option>
              <option value="ROLE_OPERATOR">Operator</option>
              <option value="ROLE_QUALITY">Quality</option>
            </Select>
          </FilterGroup>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton onClick={() => openModal("ADD")}>
            <FaPlus /> Add User
          </AddButton>
        </ControlBar>
      </HeaderSection>

      {/* 2. 사용자 리스트 테이블 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="10%">Emp ID</th>
              <th width="15%">Name</th>
              <th width="15%">Department</th>
              <th width="12%">Role</th>
              <th width="18%">Email / Phone</th>
              <th width="10%">Status</th>
              <th width="12%">Last Login</th>
              <th width="8%">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="mono">{user.id}</td>
                <td className="bold">{user.name}</td>
                <td>{user.dept}</td>
                <td>
                  <RoleBadge $role={user.role}>
                    {user.role.replace("ROLE_", "")}
                  </RoleBadge>
                </td>
                <td>
                  <ContactInfo>
                    <div>
                      <FaEnvelope size={10} /> {user.email}
                    </div>
                    <div>
                      <FaPhone size={10} /> {user.phone}
                    </div>
                  </ContactInfo>
                </td>
                <td>
                  <StatusBadge $active={user.status === "ACTIVE"}>
                    {user.status}
                  </StatusBadge>
                </td>
                <td style={{ fontSize: "13px", color: "#666" }}>
                  {user.lastLogin}
                </td>
                <td>
                  <ActionGroup>
                    <IconButton
                      title="Edit"
                      onClick={() => openModal("EDIT", user)}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      title="Reset PW"
                      $warn
                      onClick={() => handleResetPw(user.name)}
                    >
                      <FaUnlockAlt />
                    </IconButton>
                  </ActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* 3. 사용자 등록/수정 모달 */}
      {isModalOpen && (
        <Overlay>
          <ModalBox>
            <ModalHeader>
              <h3>
                <FaIdBadge />{" "}
                {modalMode === "ADD"
                  ? "New User Registration"
                  : "Edit User Information"}
              </h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <Label>Employee ID *</Label>
                  <Input
                    name="id"
                    value={currentUser.id}
                    onChange={handleChange}
                    disabled={modalMode === "EDIT"} // 수정 시 ID 변경 불가
                    placeholder="e.g. 2024001"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Full Name *</Label>
                  <Input
                    name="name"
                    value={currentUser.name}
                    onChange={handleChange}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Department</Label>
                  <Input
                    name="dept"
                    value={currentUser.dept}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Assigned Role</Label>
                  <Select
                    name="role"
                    value={currentUser.role}
                    onChange={handleChange}
                  >
                    <option value="ROLE_OPERATOR">Operator (현장직)</option>
                    <option value="ROLE_MANAGER">Manager (관리직)</option>
                    <option value="ROLE_QUALITY">Quality (품질)</option>
                    <option value="ROLE_ADMIN">Admin (시스템)</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    name="email"
                    value={currentUser.email}
                    onChange={handleChange}
                    placeholder="example@hbm.com"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    name="phone"
                    value={currentUser.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Account Status</Label>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={currentUser.status === "ACTIVE"}
                      onChange={handleChange}
                    />{" "}
                    Active (재직)
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={currentUser.status === "INACTIVE"}
                      onChange={handleChange}
                    />{" "}
                    Inactive (퇴사/휴직)
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button $primary onClick={handleSave}>
                <FaSave /> Save User
              </Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </Container>
  );
};

export default UsersPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
  padding: 20px;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h2`
  font-size: 22px;
  margin: 0;
  color: #333;
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

const ControlBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding-left: 10px;
`;

const FilterIcon = styled.div`
  color: #999;
  font-size: 12px;
`;

const Select = styled.select`
  border: none;
  outline: none;
  padding: 8px;
  background: transparent;
  color: #555;
  cursor: pointer;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;

  input {
    border: none;
    outline: none;
    margin-left: 8px;
    font-size: 14px;
    width: 200px;
  }
`;

const AddButton = styled.button`
  background-color: #1a4f8b;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background-color: #133b6b;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background-color: #f1f3f5;
    position: sticky;
    top: 0;
    th {
      padding: 12px 15px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 12px 15px;
      color: #333;
      vertical-align: middle;
    }
    tr:hover {
      background-color: #f8fbff;
    }
  }

  .mono {
    font-family: monospace;
    color: #1a4f8b;
    font-weight: 600;
  }
  .bold {
    font-weight: 600;
  }
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$role === "ROLE_ADMIN"
      ? "#333"
      : props.$role === "ROLE_MANAGER"
      ? "#e3f2fd"
      : props.$role === "ROLE_QUALITY"
      ? "#f3e5f5"
      : "#e8f5e9"};
  color: ${(props) =>
    props.$role === "ROLE_ADMIN"
      ? "#fff"
      : props.$role === "ROLE_MANAGER"
      ? "#1565c0"
      : props.$role === "ROLE_QUALITY"
      ? "#7b1fa2"
      : "#2e7d32"};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #666;
  div {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const StatusBadge = styled.span`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background-color: ${(props) => (props.$active ? "#e8f5e9" : "#ffebee")};
  color: ${(props) => (props.$active ? "#2e7d32" : "#c62828")};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: ${(props) => (props.$warn ? "#e74c3c" : "#555")};

  &:hover {
    background: #f5f5f5;
    border-color: ${(props) => (props.$warn ? "#e74c3c" : "#1a4f8b")};
    color: ${(props) => (props.$warn ? "#e74c3c" : "#1a4f8b")};
  }
`;

// Modal Styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
`;

const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  &:focus {
    border-color: #1a4f8b;
  }
  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 5px;
`;

const RadioLabel = styled.label`
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};
  &:hover {
    opacity: 0.9;
  }
`;
