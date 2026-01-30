// src/pages/admin/RolesPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaUserShield,
  FaCheck,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaUserFriends,
  FaTimes,
} from "react-icons/fa";

// --- [최적화] 서브 컴포넌트 (React.memo) ---

// 1. 역할 카드 아이템
const RoleCardItem = React.memo(({ role, isActive, onSelect }) => {
  return (
    <RoleCard $active={isActive} onClick={() => onSelect(role)}>
      <RoleHeader>
        <RoleName>{role.name}</RoleName>
        {role.isSystem && <SystemBadge>시스템</SystemBadge>}
      </RoleHeader>
      <RoleDesc>{role.description}</RoleDesc>
      <RoleMeta>
        <FaUserFriends /> {role.userCount || 0}명 배정됨
      </RoleMeta>
    </RoleCard>
  );
});

// 2. 역할 목록 패널
const RoleListPanel = React.memo(
  ({ roles, selectedRoleId, onSelectRole, onAddRole }) => {
    return (
      <RoleListPanelContainer>
        <PanelHeader>
          <h3>권한 그룹 (Roles)</h3>
          <AddButton onClick={onAddRole} title="새 역할 추가">
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

// 3. 권한 체크박스 아이템
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

// 4. 권한 그룹 섹션
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

// 5. 권한 매트릭스 패널 (우측 상세)
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
          <EmptyState>권한을 설정할 역할을 선택해주세요.</EmptyState>
        </PermissionPanel>
      );
    }

    return (
      <PermissionPanel>
        <DetailHeader>
          <div>
            <h2 style={{ margin: 0, color: "#333" }}>{selectedRole.name}</h2>
            <span style={{ fontSize: 13, color: "#666" }}>
              이 역할에 대한 세부 권한을 설정합니다.
            </span>
          </div>
          <ActionGroup>
            {isDirty && (
              <SaveBtn onClick={onSave}>
                <FaSave /> 변경사항 저장
              </SaveBtn>
            )}
            {!selectedRole.isSystem && (
              <DeleteBtn onClick={() => onDelete(selectedRole.id)}>
                <FaTrashAlt /> 역할 삭제
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

// --- 모달 컴포넌트 ---
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
    if (!name.trim()) return alert("역할 이름은 필수입니다.");
    onSave({ name, description });
    onClose();
  };

  return (
    <Overlay>
      <ModalBox>
        <ModalHeader>
          <h3>새 역할 추가</h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <label>역할 이름 (예: MANAGER)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="역할 이름을 입력하세요"
            />
          </InputGroup>
          <InputGroup>
            <label>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 역할에 대한 설명을 입력하세요..."
              rows={3}
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>추가하기</SubmitBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

// --- 메인 컴포넌트 ---

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissionIds, setEditedPermissionIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============================
  // 데이터 가져오기 (axios 사용)
  // ============================
  const fetchData = useCallback(async () => {
    try {
      // ★ [수정 2] axiosInstance 사용 (baseURL, Token 자동 처리)
      // 백엔드 컨트롤러 경로: /api/mes/roles, /api/mes/permissions 라고 가정
      // 만약 백엔드 경로가 다르다면 수정 필요 (예: /admin/roles)
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get("/api/mes/system/roles"),
        axiosInstance.get("/api/mes/system/permissions"),
      ]);

      // axios는 .data 안에 실제 데이터가 있음 (.json() 불필요)
      const rolesData = rolesRes.data || [];
      const permsData = permsRes.data || [];

      setRoles(rolesData);
      setAllPermissions(permsData);

      // 첫 번째 역할 자동 선택 (선택된 게 없을 때만)
      if (rolesData.length > 0 && !selectedRole) {
        const firstRole = rolesData[0];
        setSelectedRole(firstRole);
        setEditedPermissionIds([...(firstRole.permissionIds || [])]);
        setIsDirty(false);
      }
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
      // alert("권한 데이터를 불러오지 못했습니다.");
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchData();
  }, []); // 의존성 배열 비움 (최초 실행)

  // ============================
  // 핸들러 (API 연동 포함)
  // ============================

  const handleSelectRole = useCallback(
    (role) => {
      if (isDirty) {
        if (
          !window.confirm(
            "저장하지 않은 변경사항이 있습니다. 무시하고 이동하시겠습니까?",
          )
        )
          return;
      }
      setSelectedRole(role);
      setEditedPermissionIds([...(role.permissionIds || [])]);
      setIsDirty(false);
    },
    [isDirty],
  );

  const handleTogglePermission = useCallback(
    (permId) => {
      if (selectedRole?.isSystem && selectedRole.id === "ROLE_ADMIN") {
        alert("시스템 최고 관리자의 권한은 수정할 수 없습니다.");
        return;
      }

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

  const handleSavePermissions = useCallback(async () => {
    if (!selectedRole) return;

    try {
      // ★ [수정 3] 권한 저장 API 호출 (PUT)
      await axiosInstance.put(
        `/api/mes/system/roles/${selectedRole.id}/permissions`,
        {
          permissionIds: editedPermissionIds,
        },
      );

      // 로컬 상태 업데이트
      const updatedRoles = roles.map((r) =>
        r.id === selectedRole.id
          ? { ...r, permissionIds: editedPermissionIds }
          : r,
      );
      setRoles(updatedRoles);

      // 현재 선택된 역할 정보도 갱신
      const updatedSelected = updatedRoles.find(
        (r) => r.id === selectedRole.id,
      );
      setSelectedRole(updatedSelected);
      setIsDirty(false);

      alert(`'${selectedRole.name}' 권한이 저장되었습니다.`);
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  }, [roles, selectedRole, editedPermissionIds]);

  const handleAddRole = useCallback(async (newRoleData) => {
    try {
      // ★ [수정 4] 역할 추가 API 호출 (POST)
      const res = await axiosInstance.post("/api/mes/system/roles", {
        name: newRoleData.name,
        description: newRoleData.description,
      });

      const newRole = res.data; // 서버에서 생성된 역할 객체 받기

      setRoles((prev) => [...prev, newRole]);
      setSelectedRole(newRole);
      setEditedPermissionIds([]);
      setIsDirty(false);
      alert("새 역할이 생성되었습니다.");
    } catch (err) {
      console.error("역할 추가 실패:", err);
      alert("역할 추가에 실패했습니다.");
    }
  }, []);

  const handleDeleteRole = useCallback(
    async (roleId) => {
      if (!window.confirm("정말로 이 역할을 삭제하시겠습니까? (복구 불가)"))
        return;

      try {
        // ★ [수정 5] 역할 삭제 API 호출 (DELETE)
        await axiosInstance.delete(`/api/mes/system/roles/${roleId}`);

        const updatedRoles = roles.filter((r) => r.id !== roleId);
        setRoles(updatedRoles);

        if (updatedRoles.length > 0) {
          handleSelectRole(updatedRoles[0]);
        } else {
          setSelectedRole(null);
          setEditedPermissionIds([]);
        }
        alert("역할이 삭제되었습니다.");
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("역할 삭제 중 오류가 발생했습니다.");
      }
    },
    [roles, handleSelectRole],
  );

  // 데이터 가공 (그룹핑)
  const groupedPermissions = useMemo(() => {
    const groups = {};
    allPermissions.forEach((p) => {
      // group 속성이 없으면 '기타'로 분류
      const groupName = p.group || "기타 (Misc)";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(p);
    });
    return groups;
  }, [allPermissions]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaUserShield size={24} color="#34495e" />
          <h1>역할 및 권한 관리</h1>
        </TitleGroup>
      </Header>

      <ContentArea>
        {/* 왼쪽 패널 */}
        <RoleListPanel
          roles={roles}
          selectedRoleId={selectedRole?.id}
          onSelectRole={handleSelectRole}
          onAddRole={() => setIsModalOpen(true)}
        />

        {/* 오른쪽 패널 */}
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

      {/* 모달 */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRole}
      />
    </Container>
  );
};

export default RolesPage;

// --- 스타일 컴포넌트 ---

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
