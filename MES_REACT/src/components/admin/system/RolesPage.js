// src/pages/system/RolesPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaUserShield,
  FaShieldAlt,
  FaPlus,
  FaSave,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";

// --- Mock Data ---

// 1. 역할 목록 (Role List)
const ROLE_LIST = [
  {
    id: "ROLE_ADMIN",
    name: "System Administrator",
    desc: "전체 시스템 접근 및 설정 권한",
    users: 2,
    type: "SYSTEM",
  },
  {
    id: "ROLE_MANAGER",
    name: "Production Manager",
    desc: "생산 계획 및 기준 정보 승인 권한",
    users: 5,
    type: "CUSTOM",
  },
  {
    id: "ROLE_ENGINEER",
    name: "Process Engineer",
    desc: "공정 라우팅 및 설비 설정 권한",
    users: 12,
    type: "CUSTOM",
  },
  {
    id: "ROLE_OPERATOR",
    name: "Line Operator",
    desc: "작업 지시 조회 및 실적 등록 권한",
    users: 45,
    type: "CUSTOM",
  },
  {
    id: "ROLE_QUALITY",
    name: "Quality Inspector",
    desc: "품질 검사 및 불량 판정 권한",
    users: 8,
    type: "CUSTOM",
  },
];

// 2. 전체 메뉴 구조 (Permissions Structure)
const MENU_STRUCTURE = [
  {
    category: "Monitoring",
    menus: [
      { id: "DASHBOARD", name: "Dashboard (종합 상황판)" },
      { id: "KPI", name: "KPI Analytics" },
    ],
  },
  {
    category: "Production",
    menus: [
      { id: "PLAN", name: "Production Plan (생산 계획)" },
      { id: "WORK_ORDER", name: "Work Order (작업 지시)" },
      { id: "PERFORMANCE", name: "Performance (실적 현황)" },
      { id: "WORKER", name: "Worker Assign (작업자 배치)" },
    ],
  },
  {
    category: "Quality",
    menus: [
      { id: "STD", name: "Inspection Standard (검사 기준)" },
      { id: "DEFECT", name: "Defect Management (불량 관리)" },
      { id: "TRACKING", name: "Lot Tracking (이력 추적)" },
    ],
  },
  {
    category: "Master Data",
    menus: [
      { id: "ITEM", name: "Item Master (품목)" },
      { id: "BOM", name: "BOM Management" },
      { id: "ROUTING", name: "Routing (공정)" },
      { id: "EQUIP", name: "Equipment (설비)" },
    ],
  },
  {
    category: "System",
    menus: [
      { id: "USER", name: "User Management" },
      { id: "ROLE", name: "Role & Permission" },
      { id: "CODE", name: "Common Code" },
      { id: "LOG", name: "System Log" },
    ],
  },
];

// 3. (가상) 선택된 권한 데이터 생성 함수
const generateMockPermissions = (roleId) => {
  // 예시: Admin은 전부 True, Operator는 일부만 True
  return MENU_STRUCTURE.flatMap((group) =>
    group.menus.map((menu) => ({
      menuId: menu.id,
      read:
        roleId === "ROLE_ADMIN"
          ? true
          : roleId === "ROLE_OPERATOR"
          ? ["WORK_ORDER", "PERFORMANCE"].includes(menu.id)
          : Math.random() > 0.3,
      write:
        roleId === "ROLE_ADMIN"
          ? true
          : roleId === "ROLE_OPERATOR"
          ? ["PERFORMANCE"].includes(menu.id)
          : Math.random() > 0.6,
    }))
  );
};

const RolesPage = () => {
  const [roles, setRoles] = useState(ROLE_LIST);
  const [selectedRole, setSelectedRole] = useState(ROLE_LIST[0]);
  const [permissions, setPermissions] = useState(
    generateMockPermissions(ROLE_LIST[0].id)
  );
  const [isEditing, setIsEditing] = useState(false);

  // 역할 선택 핸들러
  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setPermissions(generateMockPermissions(role.id)); // 실제론 서버에서 가져옴
    setIsEditing(false);
  };

  // 권한 토글 핸들러
  const togglePermission = (menuId, type) => {
    if (!isEditing) return; // 편집 모드 아닐 땐 수정 불가

    setPermissions((prev) =>
      prev.map((p) => {
        if (p.menuId === menuId) {
          return { ...p, [type]: !p[type] };
        }
        return p;
      })
    );
  };

  // 저장 핸들러
  const handleSave = () => {
    // API Call Logic Here
    alert(`Permissions for [${selectedRole.name}] saved successfully.`);
    setIsEditing(false);
  };

  return (
    <Container>
      {/* 1. 좌측: 역할 목록 */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaUserShield /> Role Management
          </Title>
          <AddButton>
            <FaPlus /> Create Role
          </AddButton>
        </SidebarHeader>

        <RoleList>
          {roles.map((role) => (
            <RoleItem
              key={role.id}
              $active={selectedRole.id === role.id}
              onClick={() => handleRoleClick(role)}
            >
              <RoleIconWrapper $active={selectedRole.id === role.id}>
                <FaShieldAlt />
              </RoleIconWrapper>
              <RoleInfo>
                <RoleName>{role.name}</RoleName>
                <RoleDesc>{role.users} Users Assigned</RoleDesc>
              </RoleInfo>
              {role.type === "SYSTEM" && <SystemBadge>SYS</SystemBadge>}
            </RoleItem>
          ))}
        </RoleList>
      </Sidebar>

      {/* 2. 우측: 권한 매트릭스 */}
      <ContentArea>
        <HeaderSection>
          <HeaderLeft>
            <HeaderTitle>Permission Settings: {selectedRole.name}</HeaderTitle>
            <HeaderDesc>{selectedRole.desc}</HeaderDesc>
          </HeaderLeft>
          <HeaderRight>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button $primary onClick={handleSave}>
                  <FaSave /> Save Changes
                </Button>
              </>
            ) : (
              <Button
                $primary
                onClick={() => setIsEditing(true)}
                disabled={selectedRole.type === "SYSTEM"}
              >
                <FaEdit /> Edit Permissions
              </Button>
            )}
          </HeaderRight>
        </HeaderSection>

        <MatrixContainer>
          <Table>
            <thead>
              <tr>
                <th width="20%">Category</th>
                <th width="40%">Menu Name</th>
                <th width="20%" align="center">
                  Read (Access)
                </th>
                <th width="20%" align="center">
                  Write (Edit/Delete)
                </th>
              </tr>
            </thead>
            <tbody>
              {MENU_STRUCTURE.map((group, gIdx) => (
                <React.Fragment key={group.category}>
                  {/* 그룹 헤더 */}
                  <GroupRow>
                    <td colSpan="4">{group.category}</td>
                  </GroupRow>

                  {/* 메뉴 리스트 */}
                  {group.menus.map((menu, mIdx) => {
                    const perm = permissions.find(
                      (p) => p.menuId === menu.id
                    ) || { read: false, write: false };
                    return (
                      <tr key={menu.id}>
                        {/* 카테고리 명은 첫 번째 행에만 표시하거나 비워둠 */}
                        <td></td>
                        <td style={{ fontWeight: 500 }}>{menu.name}</td>

                        {/* Read Checkbox */}
                        <td align="center">
                          <CheckboxWrapper
                            $checked={perm.read}
                            $disabled={!isEditing}
                            onClick={() => togglePermission(menu.id, "read")}
                          >
                            {perm.read && <FaCheck size={12} color="white" />}
                          </CheckboxWrapper>
                        </td>

                        {/* Write Checkbox */}
                        <td align="center">
                          <CheckboxWrapper
                            $checked={perm.write}
                            $disabled={!isEditing}
                            onClick={() => togglePermission(menu.id, "write")}
                          >
                            {perm.write && <FaCheck size={12} color="white" />}
                          </CheckboxWrapper>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </MatrixContainer>
      </ContentArea>
    </Container>
  );
};

export default RolesPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f6fa;
  box-sizing: border-box;
`;

// Sidebar
const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    background: #133b6b;
  }
`;

const RoleList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoleItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: ${(props) => (props.$active ? "#eef2f8" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};

  &:hover {
    background-color: #f9f9f9;
  }
`;

const RoleIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#1a4f8b" : "#eee")};
  color: ${(props) => (props.$active ? "white" : "#999")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const RoleDesc = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 3px;
`;

const SystemBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  background: #333;
  color: white;
  border-radius: 4px;
  font-weight: 700;
`;

// Content Area
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div``;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  color: #333;
`;

const HeaderDesc = styled.div`
  margin-top: 5px;
  font-size: 14px;
  color: #666;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
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
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Matrix Table
const MatrixContainer = styled.div`
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;

  thead {
    background-color: #f1f3f5;
    position: sticky;
    top: 0;
    th {
      padding: 12px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;

      &:not(:first-child) {
        text-align: center;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 10px 12px;
      color: #333;
      vertical-align: middle;
    }
    tr:hover {
      background-color: #f8fbff;
    }
  }
`;

const GroupRow = styled.tr`
  background-color: #fafafa;
  font-weight: 700;
  color: #1a4f8b !important;
  td {
    padding: 12px 15px !important;
    background-color: #fcfcfc;
    border-bottom: 2px solid #eee !important;
  }
`;

const CheckboxWrapper = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.$checked ? "#1a4f8b" : "#ccc")};
  background-color: ${(props) => (props.$checked ? "#1a4f8b" : "white")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  margin: 0 auto;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => (props.$disabled ? "#ccc" : "#1a4f8b")};
  }
`;
