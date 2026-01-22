// src/pages/admin/UsersPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaEllipsisH,
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaCircle,
} from "react-icons/fa";

const UsersPage = () => {
  // --- State ---
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --- Data Fetching ---
  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // --- Filtering Logic ---
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || user.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  // --- Handlers ---
  const handleStatusToggle = (id) => {
    // Optimistic Update (실제로는 API 호출 필요)
    const updatedUsers = users.map((user) =>
      user.id === id
        ? { ...user, status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : user
    );
    setUsers(updatedUsers);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

// --- [Optimized] Sub-Components with React.memo ---

// 1. Header Component
const UserHeader = React.memo(({ onAddUser }) => {
  return (
    <Header>
      <TitleGroup>
        <FaUserTie size={24} color="#34495e" />
        <h1>User Management</h1>
      </TitleGroup>
      <PrimaryBtn onClick={onAddUser}>
        <FaUserPlus /> Add New User
      </PrimaryBtn>
    </Header>
  );
});

      {/* Controls / Toolbar */}
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
            <option value="ENGINEER">Engineer</option>
            <option value="OPERATOR">Operator</option>
            <option value="MANAGER">Manager</option>
          </Select>
          <Select value={statusFilter} onChange={onStatusChange}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </FilterGroup>

        <TotalCount>
          Total: <b>{totalCount}</b> users
        </TotalCount>
      </Toolbar>
    );
  },
);

// 3. Table Row Component
const UserTableRow = React.memo(({ user, onStatusToggle }) => {
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
            <div className="id">{user.employeeId}</div>
          </UserInfo>
        </ProfileCell>
      </td>
      <td>
        <DeptInfo>
          <FaBuilding size={10} color="#999" /> {user.department}
        </DeptInfo>
      </td>
      <td>
        <RoleBadge $role={user.role}>{user.role}</RoleBadge>
      </td>
      <td>
        <ContactCell>
          <div>
            <FaEnvelope size={10} /> {user.email}
          </div>
          <div>
            <FaPhoneAlt size={10} /> {user.phone}
          </div>
        </ContactCell>
      </td>
      <td style={{ fontSize: "13px", color: "#666" }}>{user.lastLogin}</td>
      <td>
        <StatusToggle
          $active={user.status === "ACTIVE"}
          onClick={() => onStatusToggle(user.id)}
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

// 4. Table Component
const UserTable = React.memo(({ users, onStatusToggle }) => {
  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th width="250">User Profile</th>
            <th width="150">Department</th>
            <th width="120">Role</th>
            <th width="200">Contact Info</th>
            <th width="150">Last Login</th>
            <th width="100">Status</th>
            <th width="50">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              onStatusToggle={onStatusToggle}
            />
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
});

// --- Main Component ---

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Data Fetching
  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Handlers (useCallback)
  const handleStatusToggle = useCallback((id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : user,
      ),
    );
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleRoleFilterChange = useCallback((e) => {
    setRoleFilter(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleAddUser = useCallback(() => {
    alert("Add User Modal Open");
  }, []);

  // Filtering Logic (useMemo)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <Container>
      {/* Header (Memoized) */}
      <UserHeader onAddUser={handleAddUser} />

      {/* Toolbar (Memoized) */}
      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleChange={handleRoleFilterChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilterChange}
        totalCount={filteredUsers.length}
      />

      {/* Table (Memoized) */}
      <UserTable users={filteredUsers} onStatusToggle={handleStatusToggle} />
    </Container>
  );
};

export default UsersPage;

// --- Styled Components ---

// 1. 컨테이너: 부모 높이(100%)에 맞추고 외부 스크롤 방지
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
    font-size: 14px;
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  background: white;
  font-size: 14px;
  cursor: pointer;
`;

const TotalCount = styled.div`
  font-size: 14px;
  color: #666;
  b {
    color: #333;
  }
`;

// 2. 테이블 컨테이너: 남은 높이 차지 및 내부 스크롤 적용
const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

// 3. 테이블: 헤더 고정 및 줄바꿈 방지
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fcfcfc;
  }

  th {
    text-align: left;
    background: #fcfcfc;
    padding: 15px;
    font-size: 13px;
    color: #888;
    border-bottom: 1px solid #eee;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #f5f5f5;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #fcfcfc;
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
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  .name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
  .id {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
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
  background-color: ${(props) => {
    switch (props.$role) {
      case "ADMIN":
        return "#e8daef";
      case "ENGINEER":
        return "#d6eaf8";
      case "MANAGER":
        return "#fcf3cf";
      default:
        return "#e8f6f3";
    }
  }};
  color: ${(props) => {
    switch (props.$role) {
      case "ADMIN":
        return "#8e44ad";
      case "ENGINEER":
        return "#2980b9";
      case "MANAGER":
        return "#f39c12";
      default:
        return "#16a085";
    }
  }};
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
  svg {
    color: #ccc;
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
    background: ${(props) => (props.$active ? "#2ecc71" : "#ccc")};
    border-radius: 9px;
    position: relative;
    transition: background 0.3s;

    &::after {
      content: "";
      position: absolute;
      top: 2px;
      left: ${(props) => (props.$active ? "16px" : "2px")};
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      transition: left 0.3s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => (props.$active ? "#2ecc71" : "#aaa")};
  }
`;

const ActionBtn = styled.button`
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  &:hover {
    background: #eee;
    color: #333;
  }
`;
