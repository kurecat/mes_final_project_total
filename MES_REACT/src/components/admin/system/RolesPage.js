// src/pages/admin/RolesPage.js
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  FaUserShield,
  FaLock,
  FaCheck,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaUserFriends,
} from "react-icons/fa";

const RolesPage = () => {
  // --- State ---
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissionIds, setEditedPermissionIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:3001";
        const [rolesRes, permsRes] = await Promise.all([
          fetch(`${baseUrl}/roles`),
          fetch(`${baseUrl}/permissions`),
        ]);

        const rolesData = await rolesRes.json();
        const permsData = await permsRes.json();

        setRoles(rolesData);
        setAllPermissions(permsData);

        // Default select first role
        if (rolesData.length > 0) {
          handleSelectRole(rolesData[0]);
        }
      } catch (err) {
        console.error("Error loading roles:", err);
      }
    };
    fetchData();
  }, []);

  // --- Helpers ---
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEditedPermissionIds([...role.permissionIds]); // Deep copy for editing
    setIsDirty(false);
  };

  const handleTogglePermission = (permId) => {
    if (selectedRole?.isSystem && selectedRole.id === "ROLE_ADMIN") return; // Protect Admin

    setEditedPermissionIds((prev) => {
      const exists = prev.includes(permId);
      if (exists) {
        return prev.filter((id) => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    // In Real App: API PUT request here
    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id
        ? { ...r, permissionIds: editedPermissionIds }
        : r
    );
    setRoles(updatedRoles);

    // Update selected role ref
    const updatedSelected = updatedRoles.find((r) => r.id === selectedRole.id);
    setSelectedRole(updatedSelected);
    setIsDirty(false);

    alert(`Permissions for ${selectedRole.name} saved successfully!`);
  };

  // Group permissions by 'group' field for rendering
  const groupedPermissions = useMemo(() => {
    const groups = {};
    allPermissions.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [allPermissions]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaUserShield size={24} color="#34495e" />
          <h1>Role & Permission Management</h1>
        </TitleGroup>
      </Header>

      <ContentArea>
        {/* Left Panel: Role List */}
        <RoleListPanel>
          <PanelHeader>
            <h3>Roles</h3>
            <AddButton>
              <FaPlus />
            </AddButton>
          </PanelHeader>
          <ListContainer>
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                $active={selectedRole?.id === role.id}
                onClick={() =>
                  isDirty
                    ? alert("Please save changes first.")
                    : handleSelectRole(role)
                }
              >
                <RoleHeader>
                  <RoleName>{role.name}</RoleName>
                  {role.isSystem && <SystemBadge>System</SystemBadge>}
                </RoleHeader>
                <RoleDesc>{role.description}</RoleDesc>
                <RoleMeta>
                  <FaUserFriends /> {role.userCount} Users assigned
                </RoleMeta>
              </RoleCard>
            ))}
          </ListContainer>
        </RoleListPanel>

        {/* Right Panel: Permission Matrix */}
        <PermissionPanel>
          {selectedRole ? (
            <>
              <DetailHeader>
                <div>
                  <h2 style={{ margin: 0, color: "#333" }}>
                    {selectedRole.name}
                  </h2>
                  <span style={{ fontSize: 13, color: "#666" }}>
                    Manage permissions for this role
                  </span>
                </div>
                <ActionGroup>
                  {isDirty && (
                    <SaveBtn onClick={handleSave}>
                      <FaSave /> Save Changes
                    </SaveBtn>
                  )}
                  {!selectedRole.isSystem && (
                    <DeleteBtn>
                      <FaTrashAlt />
                    </DeleteBtn>
                  )}
                </ActionGroup>
              </DetailHeader>

              <MatrixContainer>
                {Object.keys(groupedPermissions).map((groupName) => (
                  <GroupSection key={groupName}>
                    <GroupTitle>{groupName}</GroupTitle>
                    <Grid>
                      {groupedPermissions[groupName].map((perm) => {
                        const isChecked = editedPermissionIds.includes(perm.id);
                        return (
                          <PermCard
                            key={perm.id}
                            $checked={isChecked}
                            onClick={() => handleTogglePermission(perm.id)}
                          >
                            <Checkbox $checked={isChecked}>
                              {isChecked && <FaCheck size={10} color="white" />}
                            </Checkbox>
                            <PermInfo>
                              <PermName>{perm.name}</PermName>
                              <PermDesc>{perm.description}</PermDesc>
                            </PermInfo>
                          </PermCard>
                        );
                      })}
                    </Grid>
                  </GroupSection>
                ))}
              </MatrixContainer>
            </>
          ) : (
            <EmptyState>Select a role to view permissions</EmptyState>
          )}
        </PermissionPanel>
      </ContentArea>
    </Container>
  );
};

export default RolesPage;
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

// 2. 메인 콘텐츠 영역: 남은 높이 차지 및 내부 스크롤 제어
const ContentArea = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0; /* Flex 자식 요소 스크롤 버그 방지 */
`;

// Left Panel
const RoleListPanel = styled.div`
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 패널 자체 스크롤 방지 */
`;

const PanelHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
`;

const AddButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #ddd;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #eee;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto; /* 리스트 내부 스크롤 */
  padding: 10px;
`;

const RoleCard = styled.div`
  background: ${(props) => (props.$active ? "#e8f0fe" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#3498db" : "#eee")};
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    border-color: #3498db;
  }
`;

const RoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const RoleName = styled.div`
  font-weight: 700;
  color: #333;
  font-size: 15px;
`;

const SystemBadge = styled.span`
  background: #eee;
  color: #555;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

const RoleDesc = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const RoleMeta = styled.div`
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 5px;
`;

// Right Panel
const PermissionPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 패널 자체 스크롤 방지 */
`;

const DetailHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fdfdfd;
  flex-shrink: 0;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const SaveBtn = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #27ae60;
  }
`;

const DeleteBtn = styled.button`
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background: #ffebee;
  }
`;

const MatrixContainer = styled.div`
  flex: 1;
  overflow-y: auto; /* 매트릭스 내부 스크롤 */
  padding: 20px;
`;

const GroupSection = styled.div`
  margin-bottom: 30px;
`;

const GroupTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #34495e;
  font-size: 14px;
  border-bottom: 2px solid #eee;
  padding-bottom: 5px;
  display: inline-block;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
`;

const PermCard = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid ${(props) => (props.$checked ? "#3498db" : "#eee")};
  background: ${(props) => (props.$checked ? "#f4f9ff" : "white")};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3498db;
  }
`;

const Checkbox = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${(props) => (props.$checked ? "#3498db" : "#ccc")};
  background: ${(props) => (props.$checked ? "#3498db" : "white")};
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const PermInfo = styled.div`
  flex: 1;
`;

const PermName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const PermDesc = styled.div`
  font-size: 11px;
  color: #777;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 16px;
`;
