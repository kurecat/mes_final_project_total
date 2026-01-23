// src/pages/admin/UsersPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaUserPlus,
  FaSearch,
  FaEllipsisH,
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaTimes,
} from "react-icons/fa";

// --- Sub-Components (React.memo) ---

const UserHeader = React.memo(({ onAddUser }) => (
  <Header>
    <TitleGroup>
      <FaUserTie size={24} color="#34495e" />
      <h1>User Management</h1>
    </TitleGroup>
    <PrimaryBtn onClick={onAddUser}>
      <FaUserPlus /> Add New User
    </PrimaryBtn>
  </Header>
));

const UserToolbar = React.memo(
  ({
    searchTerm,
    onSearchChange,
    roleFilter,
    onRoleChange,
    statusFilter,
    onStatusChange,
    totalCount,
  }) => (
    <Toolbar>
      <FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Name, Email, ID..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
        <Select value={roleFilter} onChange={onRoleChange}>
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="OPERATOR">Operator</option>
        </Select>
        <Select value={statusFilter} onChange={onStatusChange}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
        </Select>
      </FilterGroup>
      <TotalCount>
        Total: <b>{totalCount}</b> users
      </TotalCount>
    </Toolbar>
  ),
);

const UserTableRow = React.memo(({ user, onStatusToggle }) => {
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const displayId = user.id || user.memberId;

  return (
    <tr>
      <td>
        <ProfileCell>
          <Avatar>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <Initials>{getInitials(user.name)}</Initials>
            )}
          </Avatar>
          <UserInfo>
            <div className="name">{user.name}</div>
            <div className="id">#{displayId}</div>
          </UserInfo>
        </ProfileCell>
      </td>
      <td>
        <DeptInfo>
          <FaBuilding size={10} color="#999" /> {user.department || "MES 부서"}
        </DeptInfo>
      </td>
      <td>
        <RoleBadge
          $role={
            user.authority ? user.authority.replace("ROLE_", "") : "OPERATOR"
          }
        >
          {user.authority ? user.authority.replace("ROLE_", "") : "OPERATOR"}
        </RoleBadge>
      </td>
      <td>
        <ContactCell>
          <div>
            <FaEnvelope size={10} /> {user.email}
          </div>
          <div>
            <FaPhoneAlt size={10} /> {user.phone || "010-0000-0000"}
          </div>
        </ContactCell>
      </td>
      <td style={{ fontSize: "13px", color: "#666" }}>
        {user.lastLogin || "기록 없음"}
      </td>
      <td>
        <StatusToggle
          $active={user.status === "ACTIVE"}
          onClick={() => onStatusToggle(displayId)}
        >
          <div className="knob" />
          <span className="label">{user.status}</span>
        </StatusToggle>
      </td>
      <td>
        <ActionBtn>
          <FaEllipsisH />
        </ActionBtn>
      </td>
    </tr>
  );
});

// --- Modal Component ---
const UserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    position: "",
    phone: "",
    role: "ROLE_OPERATOR", // Default role
  });

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
        position: "",
        phone: "",
        role: "ROLE_OPERATOR",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // 간단한 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      alert("이름, 이메일, 비밀번호는 필수입니다.");
      return;
    }
    onSave(formData);
  };

  return (
    <Overlay>
      <ModalBox>
        <ModalHeader>
          <h3>Add New User</h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <label>Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </InputGroup>
          <InputGroup>
            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
            />
          </InputGroup>
          <InputGroup>
            <label>Password *</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Initial Password"
            />
          </InputGroup>
          <Row>
            <InputGroup style={{ flex: 1 }}>
              <label>Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Ex) Production"
              />
            </InputGroup>
            <InputGroup style={{ flex: 1 }}>
              <label>Role</label>
              <SelectInput
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="ROLE_OPERATOR">Operator</option>
                <option value="ROLE_ADMIN">Admin</option>
              </SelectInput>
            </InputGroup>
          </Row>
          <InputGroup>
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-xxxx-xxxx"
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>Create User</SubmitBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

// --- Main Component ---

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data Loading
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    api
      .get("/auth/all")
      .then((res) => setUsers(res.data.data || []))
      .catch((err) => console.error("Data load failed:", err));
  };

  // Status Toggle (Approval)
  const handleStatusToggle = useCallback((id) => {
    if (!id) return;
    api
      .put(`/auth/approve/${id}`)
      .then((res) => {
        const updatedUser = res.data.data;
        setUsers((prev) =>
          prev.map((u) =>
            (u.id || u.memberId) == id
              ? { ...u, status: updatedUser.status }
              : u,
          ),
        );
        alert(`${updatedUser.name} 님의 상태가 변경되었습니다.`);
      })
      .catch((err) =>
        alert(
          err.response?.data?.message || "권한이 없거나 오류가 발생했습니다.",
        ),
      );
  }, []);

  // Add User Logic
  const handleAddUser = useCallback((newUser) => {
    // API 호출 (회원가입 엔드포인트 사용 가정)
    api
      .post("/auth/signup", newUser)
      .then((res) => {
        alert("사용자가 성공적으로 생성되었습니다.");
        setIsModalOpen(false);
        loadUsers(); // 목록 새로고침
      })
      .catch((err) => {
        console.error(err);
        alert(
          "사용자 생성 실패: " +
            (err.response?.data?.message || "Unknown error"),
        );
      });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const userRole = user.authority
        ? user.authority.replace("ROLE_", "")
        : "OPERATOR";
      const matchRole = roleFilter === "ALL" || userRole === roleFilter;
      const matchStatus =
        statusFilter === "ALL" || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <Container>
      <UserHeader onAddUser={() => setIsModalOpen(true)} />
      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        roleFilter={roleFilter}
        onRoleChange={(e) => setRoleFilter(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={(e) => setStatusFilter(e.target.value)}
        totalCount={filteredUsers.length}
      />
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>User Profile</th>
              <th>Department</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Login</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <UserTableRow
                key={u.id || u.memberId}
                user={u}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddUser}
      />
    </Container>
  );
};

export default UsersPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h1 {
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
  }
`;
const PrimaryBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 280px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    width: 100%;
  }
`;
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
`;
const TotalCount = styled.div`
  font-size: 14px;
  color: #666;
  b {
    color: #333;
  }
`;
const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fcfcfc;
  }
  th {
    text-align: left;
    padding: 15px;
    font-size: 13px;
    color: #888;
    border-bottom: 1px solid #eee;
  }
  td {
    padding: 15px;
    border-bottom: 1px solid #f5f5f5;
  }
`;
const ProfileCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const Initials = styled.span`
  font-weight: bold;
  color: #555;
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  .name {
    font-weight: 600;
    color: #333;
  }
  .id {
    font-size: 12px;
    color: #888;
  }
`;
const DeptInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 13px;
`;
const RoleBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(p) => (p.$role === "ADMIN" ? "#e8daef" : "#e8f6f3")};
  color: ${(p) => (p.$role === "ADMIN" ? "#8e44ad" : "#16a085")};
`;
const ContactCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #555;
  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;
const StatusToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  .knob {
    width: 32px;
    height: 18px;
    background: ${(p) => (p.$active ? "#2ecc71" : "#ccc")};
    border-radius: 9px;
    position: relative;
    transition: 0.3s;
    &::after {
      content: "";
      position: absolute;
      top: 2px;
      left: ${(p) => (p.$active ? "16px" : "2px")};
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
  }
  .label {
    font-size: 12px;
    font-weight: 600;
    color: ${(p) => (p.$active ? "#2ecc71" : "#aaa")};
  }
`;
const ActionBtn = styled.button`
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalBox = styled.div`
  background: white;
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;
const ModalHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    color: #333;
  }
  button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
`;
const InputGroup = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #666;
  }
  input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #1a4f8b;
    }
  }
`;
const SelectInput = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;
const Row = styled.div`
  display: flex;
  gap: 10px;
`;
const ModalFooter = styled.div`
  padding: 15px 20px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const CancelBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #f1f1f1;
  }
`;
const SubmitBtn = styled.button`
  padding: 8px 16px;
  border: none;
  background: #1a4f8b;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: #133b6b;
  }
`;
