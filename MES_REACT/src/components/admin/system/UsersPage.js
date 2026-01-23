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

// --- Main Component ---

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    api
      .get("/auth/all")
      .then((res) => setUsers(res.data.data || []))
      .catch((err) => console.error("Data load failed:", err));
  }, []);

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
        alert(`${updatedUser.name} 승인 완료!`);
      })
      .catch((err) => alert(err.response?.data?.message || "권한이 없습니다."));
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
      <UserHeader onAddUser={() => alert("Modal Open")} />
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
    </Container>
  );
};

export default UsersPage;

// --- Styled Components (생략 - 기존 스타일 유지 또는 이전 답변 참조) ---
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
