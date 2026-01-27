import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaUserTie,
  FaUserPlus,
  FaSearch,
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt,
  FaEllipsisH,
  FaTimes,
} from "react-icons/fa";

// --- [Sub-Components] ---

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
  ({ searchTerm, onSearchChange, roleFilter, onRoleChange, totalCount }) => (
    <Toolbar>
      <FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Name, Email..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
        <Select value={roleFilter} onChange={onRoleChange}>
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="OPERATOR">Operator</option>
        </Select>
      </FilterGroup>
      <TotalCount>
        Total: <b>{totalCount}</b> users
      </TotalCount>
    </Toolbar>
  ),
);

const UserTableRow = React.memo(({ user, onToggleStatus }) => {
  // DB 상태가 ACTIVE면 true(초록), 아니면 false(회색)
  const isActive = user.status === "ACTIVE";
  const userRole = user.authority
    ? user.authority.replace("ROLE_", "")
    : "OPERATOR";

  return (
    <tr>
      <td>
        <ProfileCell>
          <Avatar>{user.name ? user.name.substring(0, 1) : "U"}</Avatar>
          <UserInfo>
            <div className="name">{user.name}</div>
            <div className="email">{user.email}</div>
          </UserInfo>
        </ProfileCell>
      </td>
      <td>
        <DeptInfo>
          <FaBuilding size={10} color="#999" /> {user.department || "MES Team"}
        </DeptInfo>
      </td>
      <td>
        <RoleBadge $role={userRole}>{userRole}</RoleBadge>
      </td>
      <td>
        <div style={{ fontSize: "13px", color: "#555" }}>
          <FaPhoneAlt size={10} /> {user.phone || "-"}
        </div>
      </td>
      <td>
        {/* ★ 슬라이드 토글 스위치 적용 ★ */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <StatusToggle
            $active={isActive}
            onClick={() => onToggleStatus(user, isActive)}
          >
            <div className="knob" />
          </StatusToggle>
          <StatusText $active={isActive}>{user.status}</StatusText>
        </div>
      </td>
      <td>
        <ActionBtn>
          <FaEllipsisH />
        </ActionBtn>
      </td>
    </tr>
  );
});

const UserModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "ROLE_OPERATOR",
  });

  useEffect(() => {
    if (isOpen)
      setForm({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "ROLE_OPERATOR",
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      alert("필수 입력값을 확인해주세요.");
      return;
    }
    onSave(form);
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
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </InputGroup>
          <InputGroup>
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </InputGroup>
          <InputGroup>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </InputGroup>
          <InputGroup>
            <label>Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>Create</SubmitBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

// --- [Main Component] ---

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데이터 로딩
  const loadUsers = useCallback(() => {
    api
      .get("/api/mes/system/role")
      .then((res) => setUsers(res.data.data || res.data || []))
      .catch((err) => console.error("Load Error:", err));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ★ 상태 변경 (승인 <-> 취소)
  // ★ 상태 변경 (승인 <-> 취소 토글)
  const handleToggleStatus = useCallback(
    (user, currentIsActive) => {
      // 1. 사용자에게 먼저 물어보기 (실수 방지)
      const actionName = currentIsActive ? "승인 취소(대기)" : "승인(활성화)";
      if (
        !window.confirm(`'${user.name}' 님을 ${actionName} 처리하시겠습니까?`)
      )
        return;

      // 2. 자바 백엔드로 요청 보내기
      // 형님 자바 서비스 approveMember(memberId) 호출하는 API 경로 확인!
      api
        .put(`/auth/approve/${user.id || user.memberId}`)
        .then((res) => {
          if (res.data.success) {
            // alert(res.data.message); // "회원 승인 취소" 등의 메시지 뜸

            // 3. ★ 핵심: 자바에서 DB 바꿨으니 리액트도 데이터를 다시 받아와야 함!
            loadUsers();
          }
        })
        .catch((err) => {
          console.error("상태 변경 실패:", err);
          alert(
            "처리에 실패했습니다: " +
              (err.response?.data?.message || "서버 오류"),
          );
        });
    },
    [loadUsers],
  );

  const handleAddUser = useCallback(
    (newUser) => {
      api
        .post("/auth/signup", newUser)
        .then(() => {
          alert("생성 완료");
          setIsModalOpen(false);
          loadUsers();
        })
        .catch((err) =>
          alert("실패: " + (err.response?.data?.message || "오류")),
        );
    },
    [loadUsers],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const uRole = u.authority ? u.authority.replace("ROLE_", "") : "OPERATOR";
      const matchRole = roleFilter === "ALL" || uRole === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <Container>
      <UserHeader onAddUser={() => setIsModalOpen(true)} />
      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        roleFilter={roleFilter}
        onRoleChange={(e) => setRoleFilter(e.target.value)}
        totalCount={filteredUsers.length}
      />
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>User</th>
              <th>Dept</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Status (Approve)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <UserTableRow
                key={u.id || u.memberId}
                user={u}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddUser}
      />
    </Container>
  );
};

export default UsersPage;

// --- [Styled Components] ---
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  background: #3498db;
  color: white;
  border: none;
  padding: 0 16px;
  height: 36px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #2980b9;
  }
`;
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 36px;
  svg {
    color: #999;
  }
  input {
    border: none;
    margin-left: 8px;
    outline: none;
    font-size: 14px;
    width: 200px;
  }
`;
const Select = styled.select`
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  background: white;
`;
const TotalCount = styled.div`
  font-size: 14px;
  color: #666;
  b {
    color: #333;
  }
`;
const TableContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead {
    position: sticky;
    top: 0;
    background: #f8f9fa;
    z-index: 10;
  }
  th {
    text-align: left;
    padding: 15px;
    font-size: 13px;
    color: #666;
    border-bottom: 2px solid #eee;
  }
  td {
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
    color: #333;
  }
`;
const ProfileCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const Avatar = styled.div`
  width: 36px;
  height: 36px;
  background: #ecf0f1;
  color: #7f8c8d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;
const UserInfo = styled.div`
  .name {
    font-weight: 600;
    font-size: 14px;
  }
  .email {
    font-size: 12px;
    color: #888;
  }
`;
const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  background: ${(props) => (props.$role === "ADMIN" ? "#fadbd8" : "#d6eaf8")};
  color: ${(props) => (props.$role === "ADMIN" ? "#c0392b" : "#2980b9")};
`;
const ActionBtn = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;
const DeptInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
`;

// ★ 토글 스위치 스타일 (공통 코드랑 똑같은 디자인)
const StatusToggle = styled.div`
  width: 40px;
  height: 22px;
  background: ${(props) => (props.$active ? "#2ecc71" : "#bdc3c7")};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
  margin-right: 8px;

  .knob {
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: ${(props) => (props.$active ? "20px" : "2px")};
    transition: left 0.3s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;
const StatusText = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: ${(props) => (props.$active ? "#2ecc71" : "#95a5a6")};
`;

// Modal Styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;
const ModalBox = styled.div`
  background: white;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s;
`;
const ModalHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 16px;
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const ModalFooter = styled.div`
  padding: 15px 20px;
  background: #f9f9f9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
  input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    &:focus {
      border-color: #3498db;
    }
  }
`;

const SubmitBtn = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #2980b9;
  }
`;
const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* ★ 여기가 핵심: 헤더 글자색 노란색(오렌지) 적용 ★ */
  th {
    text-align: left;
    background: #fff;
    padding: 12px 15px;
    font-size: 13px;
    color: #e67e22; /* 글자색 변경! */
    font-weight: 800;
    border-bottom: 2px solid #f39c12;
  }

  td {
    padding: 10px 15px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }
  .mono {
    font-family: monospace;
    font-size: 13px;
    color: #555;
  }
  .category {
    font-weight: 600;
    font-size: 12px;
    color: #e67e22;
  }
  .message {
    color: #222;
  }
  .empty {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
`;
const CancelBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  color: #555;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
`;
