// src/pages/admin/RolesPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  FaUserShield,
  FaCheck,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaUserFriends,
  FaTimes,
} from "react-icons/fa";

// --- [Optimized] Sub-Components with React.memo ---

// 1. Role Card Item
const RoleCardItem = React.memo(({ role, isActive, onSelect }) => {
  return (
    <RoleCard $active={isActive} onClick={() => onSelect(role)}>
      <RoleHeader>
        <RoleName>{role.name}</RoleName>
        {role.isSystem && <SystemBadge>System</SystemBadge>}
      </RoleHeader>
      <RoleDesc>{role.description}</RoleDesc>
      <RoleMeta>
        <FaUserFriends /> {role.userCount} Users assigned
      </RoleMeta>
    </RoleCard>
  );
});

// 2. Role List Panel
const RoleListPanel = React.memo(
  ({ roles, selectedRoleId, onSelectRole, onAddRole }) => {
    return (
      <RoleListPanelContainer>
        <PanelHeader>
          <h3>Roles</h3>
          <AddButton onClick={onAddRole}>
            <FaPlus />
          </AddButton>
        </PanelHeader>
        <ListContainer>
          {roles.map((role) => (
            <RoleCardItem
              key={role.id}
              role={role}
              isActive={selectedRoleId === role.id}
              onSelect={onSelectRole}
            />
          ))}
        </ListContainer>
      </RoleListPanelContainer>
    );
  },
);

// 3. Permission Item
const PermissionItem = React.memo(({ perm, isChecked, onToggle }) => {
  return (
    <PermCard $checked={isChecked} onClick={() => onToggle(perm.id)}>
      <Checkbox $checked={isChecked}>
        {isChecked && <FaCheck size={10} color="white" />}
      </Checkbox>
      <PermInfo>
        <PermName>{perm.name}</PermName>
        <PermDesc>{perm.description}</PermDesc>
      </PermInfo>
    </PermCard>
  );
});

// 4. Permission Group Section
const PermissionGroup = React.memo(
  ({ groupName, permissions, editedPermissionIds, onToggle }) => {
    return (
      <GroupSection>
        <GroupTitle>{groupName}</GroupTitle>
        <Grid>
          {permissions.map((perm) => (
            <PermissionItem
              key={perm.id}
              perm={perm}
              isChecked={editedPermissionIds.includes(perm.id)}
              onToggle={onToggle}
            />
          ))}
        </Grid>
      </GroupSection>
    );
  },
);

// 5. Permission Matrix Panel
const PermissionMatrix = React.memo(
  ({
    selectedRole,
    groupedPermissions,
    editedPermissionIds,
    isDirty,
    onSave,
    onDelete,
    onTogglePermission,
  }) => {
    if (!selectedRole) {
      return (
        <PermissionPanel>
          <EmptyState>Select a role to view permissions</EmptyState>
        </PermissionPanel>
      );
    }

    return (
      <PermissionPanel>
        <DetailHeader>
          <div>
            <h2 style={{ margin: 0, color: "#333" }}>{selectedRole.name}</h2>
            <span style={{ fontSize: 13, color: "#666" }}>
              Manage permissions for this role
            </span>
          </div>
          <ActionGroup>
            {isDirty && (
              <SaveBtn onClick={onSave}>
                <FaSave /> Save Changes
              </SaveBtn>
            )}
            {!selectedRole.isSystem && (
              <DeleteBtn onClick={() => onDelete(selectedRole.id)}>
                <FaTrashAlt /> Delete Role
              </DeleteBtn>
            )}
          </ActionGroup>
        </DetailHeader>

        <MatrixContainer>
          {Object.keys(groupedPermissions).map((groupName) => (
            <PermissionGroup
              key={groupName}
              groupName={groupName}
              permissions={groupedPermissions[groupName]}
              editedPermissionIds={editedPermissionIds}
              onToggle={onTogglePermission}
            />
          ))}
        </MatrixContainer>
      </PermissionPanel>
    );
  },
);

// --- Modal Component ---
const RoleModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return alert("Role Name is required");
    onSave({ name, description });
    onClose();
  };

  return (
    <Overlay>
      <ModalBox>
        <ModalHeader>
          <h3>Add New Role</h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <label>Role Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MANAGER"
            />
          </InputGroup>
          <InputGroup>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role description..."
              rows={3}
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>Create Role</SubmitBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

// --- Main Component ---

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissionIds, setEditedPermissionIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Data
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

        if (rolesData.length > 0) {
          const firstRole = rolesData[0];
          setSelectedRole(firstRole);
          setEditedPermissionIds([...firstRole.permissionIds]);
          setIsDirty(false);
        }
      } catch (err) {
        console.error("Error loading roles:", err);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSelectRole = useCallback(
    (role) => {
      if (isDirty) {
        if (
          !window.confirm(
            "Unsaved changes will be lost. Do you want to continue?",
          )
        )
          return;
      }
      setSelectedRole(role);
      setEditedPermissionIds([...role.permissionIds]);
      setIsDirty(false);
    },
    [isDirty],
  );

  const handleTogglePermission = useCallback(
    (permId) => {
      if (selectedRole?.isSystem && selectedRole.id === "ROLE_ADMIN") return;

      setEditedPermissionIds((prev) => {
        const exists = prev.includes(permId);
        if (exists) {
          return prev.filter((id) => id !== permId);
        } else {
          return [...prev, permId];
        }
      });
      setIsDirty(true);
    },
    [selectedRole],
  );

  const handleSavePermissions = useCallback(() => {
    const updatedRoles = roles.map((r) =>
      r.id === selectedRole.id
        ? { ...r, permissionIds: editedPermissionIds }
        : r,
    );
    setRoles(updatedRoles);

    const updatedSelected = updatedRoles.find((r) => r.id === selectedRole.id);
    setSelectedRole(updatedSelected);
    setIsDirty(false);

    alert(`Permissions for ${selectedRole.name} saved successfully!`);
  }, [roles, selectedRole, editedPermissionIds]);

  // Add Role Logic
  const handleAddRole = useCallback((newRoleData) => {
    const newRole = {
      id: `ROLE_${newRoleData.name.toUpperCase().replace(/\s+/g, "_")}`,
      name: newRoleData.name,
      description: newRoleData.description,
      isSystem: false,
      userCount: 0,
      permissionIds: [], // Default empty permissions
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRole(newRole);
    setEditedPermissionIds([]);
    setIsDirty(false);
  }, []);

  // Delete Role Logic
  const handleDeleteRole = useCallback(
    (roleId) => {
      if (!window.confirm("Are you sure you want to delete this role?")) return;

      const updatedRoles = roles.filter((r) => r.id !== roleId);
      setRoles(updatedRoles);

      if (updatedRoles.length > 0) {
        handleSelectRole(updatedRoles[0]);
      } else {
        setSelectedRole(null);
        setEditedPermissionIds([]);
      }
    },
    [roles, handleSelectRole],
  );

  // Derived Data
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
        {/* Left Panel */}
        <RoleListPanel
          roles={roles}
          selectedRoleId={selectedRole?.id}
          onSelectRole={handleSelectRole}
          onAddRole={() => setIsModalOpen(true)}
        />

        {/* Right Panel */}
        <PermissionMatrix
          selectedRole={selectedRole}
          groupedPermissions={groupedPermissions}
          editedPermissionIds={editedPermissionIds}
          isDirty={isDirty}
          onSave={handleSavePermissions}
          onDelete={handleDeleteRole}
          onTogglePermission={handleTogglePermission}
        />
      </ContentArea>

      {/* Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRole}
      />
    </Container>
  );
};

export default RolesPage;

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

const ContentArea = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
`;

const RoleListPanelContainer = styled.div`
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  overflow-y: auto;
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

const PermissionPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  gap: 5px;
  &:hover {
    background: #ffebee;
  }
`;

const MatrixContainer = styled.div`
  flex: 1;
  overflow-y: auto;
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
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
    font-size: 18px;
    color: #333;
  }
  button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    &:hover {
      color: #333;
    }
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
  input,
  textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #3498db;
    }
  }
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
  font-size: 13px;
  &:hover {
    background: #f1f1f1;
  }
`;

const SubmitBtn = styled.button`
  padding: 8px 16px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  &:hover {
    background: #2980b9;
  }
`;
