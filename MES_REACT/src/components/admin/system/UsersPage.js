import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styled from "styled-components";
import api from "../../../api/axios";
import {
  FaUserTie,
  FaUserPlus,
  FaSearch,
  FaBuilding,
  FaPhoneAlt,
  FaEllipsisH,
  FaTimes,
  FaEdit,
  FaTrash,
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

const UserTableRow = React.memo(
  ({ user, onToggleStatus, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const isActive = user.status === "ACTIVE";
    // authority가 "ROLE_ADMIN"이면 "ADMIN"만 표시
    const userRole = user.authority
      ? user.authority.replace("ROLE_", "")
      : "OPERATOR";

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };
      if (showMenu) document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

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
            <FaBuilding size={10} color="#999" />{" "}
            {user.department || "MES Team"}
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
        <td style={{ position: "relative" }}>
          <ActionBtn onClick={() => setShowMenu(!showMenu)}>
            <FaEllipsisH />
          </ActionBtn>

          {showMenu && (
            <ActionMenu ref={menuRef}>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  onEdit(user);
                }}
              >
                <FaEdit /> 수정 (Edit)
              </MenuItem>
              <MenuItem
                $danger
                onClick={() => {
                  setShowMenu(false);
                  onDelete(user);
                }}
              >
                <FaTrash /> 삭제 (Delete)
              </MenuItem>
            </ActionMenu>
          )}
        </td>
      </tr>
    );
  },
);

// ★ 권한 선택 기능이 추가된 Modal
const UserModal = ({ isOpen, onClose, onSave, selectedUser }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "ROLE_OPERATOR", // 기본값
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (selectedUser) {
        // [수정 모드]
        setForm({
          name: selectedUser.name || "",
          email: selectedUser.email || "",
          password: "",
          department: selectedUser.department || "",
          role: selectedUser.authority || "ROLE_OPERATOR",
          phone: selectedUser.phone || "",
        });
      } else {
        // [생성 모드]
        setForm({
          name: "",
          email: "",
          password: "",
          department: "",
          role: "ROLE_OPERATOR",
          phone: "",
        });
      }
    }
  }, [isOpen, selectedUser]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      alert("이름과 이메일은 필수입니다.");
      return;
    }
    if (!selectedUser && !form.password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    onSave(form);
  };

  return (
    <Overlay>
      <ModalBox>
        <ModalHeader>
          <h3>{selectedUser ? "Edit User" : "Add New User"}</h3>
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
              disabled={!!selectedUser}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </InputGroup>
          <InputGroup>
            <label>
              Password {selectedUser && "(Leave blank to keep current)"}
            </label>
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

          {/* ★ Role Select Box */}
          <InputGroup>
            <label>Role</label>
            <SelectInput
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ROLE_OPERATOR">Operator (생산직)</option>
              <option value="ROLE_ADMIN">Admin (관리자)</option>
            </SelectInput>
          </InputGroup>

          <InputGroup>
            <label>Phone (Contact)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>
            {selectedUser ? "Update" : "Create"}
          </SubmitBtn>
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
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(() => {
    api
      .get("/api/mes/system/role")
      .then((res) => setUsers(res.data.data || res.data || []))
      .catch((err) => console.error("Load Error:", err));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = useCallback(
    (user, currentIsActive) => {
      const actionName = currentIsActive ? "승인 취소(대기)" : "승인(활성화)";
      if (
        !window.confirm(`'${user.name}' 님을 ${actionName} 처리하시겠습니까?`)
      )
        return;

      api
        .put(`/auth/approve/${user.id || user.memberId}`)
        .then((res) => {
          if (res.data.success) loadUsers();
        })
        .catch((err) =>
          alert("실패: " + (err.response?.data?.message || "오류")),
        );
    },
    [loadUsers],
  );

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = useCallback((user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    (user) => {
      if (!window.confirm(`정말로 '${user.name}' 님을 삭제하시겠습니까?`))
        return;

      api
        .delete(`/auth/delete/${user.id || user.memberId}`)
        .then(() => {
          alert("삭제되었습니다.");
          loadUsers();
        })
        .catch((err) => alert("삭제 실패: " + err.message));
    },
    [loadUsers],
  );

  const handleSaveUser = useCallback(
    (formData) => {
      if (selectedUser) {
        // Update
        api
          .put(
            `/auth/update/${selectedUser.id || selectedUser.memberId}`,
            formData,
          )
          .then(() => {
            alert("수정 완료");
            setIsModalOpen(false);
            loadUsers();
          })
          .catch((err) => alert("수정 실패: " + err.message));
      } else {
        // Create
        api
          .post("/auth/signup", formData)
          .then(() => {
            alert("생성 완료");
            setIsModalOpen(false);
            loadUsers();
          })
          .catch((err) =>
            alert("실패: " + (err.response?.data?.message || "오류")),
          );
      }
    },
    [loadUsers, selectedUser],
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
      <UserHeader onAddUser={handleOpenAdd} />
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
                onEdit={handleOpenEdit}
                onDelete={handleDeleteUser}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        selectedUser={selectedUser}
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
  margin-bottom: 70px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
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
  padding: 5px;
  &:hover {
    color: #333;
    background: #f0f0f0;
    border-radius: 4px;
  }
`;
const DeptInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
`;
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

const ActionMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 120px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: white;
  text-align: left;
  font-size: 13px;
  color: ${(props) => (props.$danger ? "#e74c3c" : "#333")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;

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
    &:disabled {
      background: #f5f5f5;
      color: #999;
    }
  }
`;

// ★ SelectInput 추가
const SelectInput = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  background-color: white;
  font-size: 14px;
  color: #333;
  width: 100%;
  &:focus {
    border-color: #3498db;
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
