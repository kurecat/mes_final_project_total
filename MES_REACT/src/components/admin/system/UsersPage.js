import React, { useState, useEffect } from "react";
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 1. 데이터 로드 (백엔드 8111 포트 연동)
  useEffect(() => {
    api
      .get("/auth/all") // axios.js에 baseURL이 잡혀있으므로 상대경로 권장
      .then((res) => {
        console.log("🔥 서버에서 온 데이터 원본:", res.data.data[0]);
        setUsers(res.data.data || []);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
      });
  }, []);

  // 2. 필터링 로직 (ID 검색 보강)
  const filteredUsers = users.filter((user) => {
    const userId = user.id || user.memberId || "";
    const matchSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(userId).includes(searchTerm);

    const userRole = user.authority
      ? user.authority.replace("ROLE_", "")
      : "OPERATOR";
    const matchRole = roleFilter === "ALL" || userRole === roleFilter;
    const matchStatus = statusFilter === "ALL" || user.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  // 3. 상태 변경 핸들러 (승인 로직 핵심)
  const handleStatusToggle = (targetId) => {
    console.log("🔍 승인 요청 시도 ID:", targetId);

    if (!targetId) {
      alert("사용자 ID를 찾을 수 없습니다.");
      return;
    }

    // 서버 승인 API 호출 (상대경로 사용하여 인터셉터 토큰 보장)
    api
      .put(`/auth/approve/${targetId}`)
      .then((res) => {
        const updatedUser = res.data.data;

        // 화면 리스트 즉시 갱신
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            const currentId = user.id || user.memberId;
            return currentId == targetId
              ? { ...user, status: updatedUser.status }
              : user;
          }),
        );

        alert(`${updatedUser.name} 사원의 승인이 완료되었습니다!`);
      })
      .catch((err) => {
        console.error("승인 실패 상세:", err.response?.data);
        const errorMsg =
          err.response?.data?.message ||
          "관리자 권한이 필요하거나 이미 승인된 사용자입니다.";
        alert(errorMsg);
      });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaUserTie size={24} color="#34495e" />
          <h1>User Management</h1>
        </TitleGroup>
        <PrimaryBtn>
          <FaUserPlus /> Add New User
        </PrimaryBtn>
      </Header>

      <Toolbar>
        <FilterGroup>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Name, Email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="OPERATOR">Operator</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
          </Select>
        </FilterGroup>

        <TotalCount>
          Total: <b>{filteredUsers.length}</b> users
        </TotalCount>
      </Toolbar>

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
            {filteredUsers.map((user) => {
              const displayId = user.id || user.memberId;
              return (
                <tr key={displayId}>
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
                      <FaBuilding size={10} color="#999" />{" "}
                      {user.department || "MES 부서"}
                    </DeptInfo>
                  </td>
                  <td>
                    <RoleBadge
                      $role={
                        user.authority
                          ? user.authority.replace("ROLE_", "")
                          : "OPERATOR"
                      }
                    >
                      {user.authority
                        ? user.authority.replace("ROLE_", "")
                        : "OPERATOR"}
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
                    {user.lastLogin || "최근 기록 없음"}
                  </td>
                  <td>
                    <StatusToggle
                      $active={user.status === "ACTIVE"}
                      onClick={() => handleStatusToggle(displayId)}
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
            })}
          </tbody>
        </Table>
      </TableContainer>
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
  flex: 1; /* 남은 공간 채움 */
  overflow: auto; /* 내부 스크롤 활성화 */
  display: flex;
  flex-direction: column;
`;

// 3. 테이블: 헤더 고정 및 줄바꿈 방지
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */

  thead {
    position: sticky; /* 헤더 고정 */
    top: 0;
    z-index: 10;
    background: #fcfcfc; /* 헤더 배경색 지정 필수 */
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
        return "#e8daef"; // Purple
      case "ENGINEER":
        return "#d6eaf8"; // Blue
      case "MANAGER":
        return "#fcf3cf"; // Yellow
      default:
        return "#e8f6f3"; // Green (Operator)
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
