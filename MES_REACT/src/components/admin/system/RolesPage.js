import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaUserShield,
  FaCheck,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaLock,
  FaEdit,
} from "react-icons/fa";

// --- [서브 컴포넌트] ---

// 1. 역할 카드
const RoleCardItem = React.memo(({ role, isActive, onSelect }) => {
  return (
    <RoleCard $active={isActive} onClick={() => onSelect(role)}>
      <RoleHeader>
        <RoleName>{role.name}</RoleName>
        {role.isSystem ? (
          <SystemBadge>
            <FaLock size={10} /> 시스템
          </SystemBadge>
        ) : (
          <CodeBadge>{role.code}</CodeBadge>
        )}
      </RoleHeader>
      <RoleDesc>{role.description || "설명 없음"}</RoleDesc>
    </RoleCard>
  );
});

// 2. 권한 체크박스
const PermissionItem = React.memo(({ perm, isChecked, onToggle, disabled }) => {
  return (
    <PermCard
      $checked={isChecked}
      $disabled={disabled}
      onClick={() => !disabled && onToggle(perm.id)}
    >
      <Checkbox $checked={isChecked} $disabled={disabled}>
        {isChecked && <FaCheck size={10} color="white" />}
      </Checkbox>
      <PermInfo>
        <PermName>{perm.name}</PermName>
        <PermCode>{perm.code}</PermCode>
        {/* <PermDesc>{perm.description}</PermDesc> 설명이 길면 생략 가능 */}
      </PermInfo>
    </PermCard>
  );
});

// 3. 권한 그룹 (섹션)
const PermissionGroup = React.memo(
  ({ groupName, permissions, editedPermissionIds, onToggle, roleIsAdmin }) => {
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
              disabled={roleIsAdmin && perm.isSystem}
            />
          ))}
        </Grid>
      </GroupSection>
    );
  },
);

// 4. 모달
const RoleModal = ({ isOpen, onClose, onSave, initialData, isEditMode }) => {
  const [form, setForm] = useState({
    name: "",
    code: "ROLE_",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setForm({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || "",
        });
      } else {
        setForm({ name: "", code: "ROLE_", description: "" });
      }
    }
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name || !form.code) return alert("역할 명과 코드는 필수입니다.");
    onSave(form);
  };

  return (
    <Overlay>
      <ModalBox>
        <ModalHeader>
          <h3>{isEditMode ? "역할 정보 수정" : "새 역할 정의"}</h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <label>역할 이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </InputGroup>
          <InputGroup>
            <label>역할 코드</label>
            <input
              value={form.code}
              disabled={isEditMode}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              style={{ backgroundColor: isEditMode ? "#f5f5f5" : "white" }}
            />
          </InputGroup>
          <InputGroup>
            <label>설명</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>
            {isEditMode ? "수정 저장" : "생성"}
          </SubmitBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

// --- [메인 페이지] ---

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissionIds, setEditedPermissionIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 데이터 로딩
  const fetchData = useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get("/api/mes/system/roles"),
        axiosInstance.get("/api/mes/system/permissions"),
      ]);

      const roleList = rolesRes.data || [];
      const permList = permsRes.data || [];

      setRoles(roleList);
      setAllPermissions(permList);

      if (roleList.length > 0 && !selectedRole) {
        selectRole(roleList[0]);
      }
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchData();
  }, []);

  const selectRole = (role) => {
    setSelectedRole(role);
    setEditedPermissionIds(role.permissionIds ? [...role.permissionIds] : []);
    setIsDirty(false);
  };

  const handleTogglePermission = useCallback((permId) => {
    setEditedPermissionIds((prev) => {
      if (prev.includes(permId)) return prev.filter((id) => id !== permId);
      else return [...prev, permId];
    });
    setIsDirty(true);
  }, []);

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await axiosInstance.put(
        `/api/mes/system/role/${selectedRole.id}/permissions`,
        { permissionIds: editedPermissionIds },
      );
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? { ...r, permissionIds: editedPermissionIds }
            : r,
        ),
      );
      setIsDirty(false);
      alert("저장되었습니다.");
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  const handleAddRole = async (formData) => {
    try {
      const res = await axiosInstance.post("/api/mes/system/role", formData);
      setRoles((prev) => [...prev, res.data]);
      selectRole(res.data);
      setIsModalOpen(false);
      alert("생성되었습니다.");
    } catch (err) {
      alert("생성 실패: " + err.message);
    }
  };

  const handleUpdateRole = async (formData) => {
    try {
      await axiosInstance.put(
        `/api/mes/system/role/${selectedRole.id}`,
        formData,
      );
      const updatedRole = { ...selectedRole, ...formData };
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? { ...updatedRole, permissionIds: r.permissionIds }
            : r,
        ),
      );
      setSelectedRole(updatedRole);
      setIsModalOpen(false);
      alert("수정되었습니다.");
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  const handleDeleteRole = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/api/mes/system/role/${selectedRole.id}`);
      const filtered = roles.filter((r) => r.id !== selectedRole.id);
      setRoles(filtered);
      if (filtered.length > 0) selectRole(filtered[0]);
      else setSelectedRole(null);
      alert("삭제되었습니다.");
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  // ★ 핵심 수정: 그룹핑 로직 (groupName 처리)
  const groupedPermissions = useMemo(() => {
    const groups = {};
    allPermissions.forEach((p) => {
      // DB의 group_name -> JSON의 groupName으로 넘어오는 경우가 많음
      const g = p.groupName || p.group_name || p.group || "기타 (Misc)";

      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });

    // 키 정렬 (가나다 순) - 필요시 주석 해제
    // const sortedKeys = Object.keys(groups).sort();
    // const sortedGroups = {};
    // sortedKeys.forEach(key => sortedGroups[key] = groups[key]);
    // return sortedGroups;

    return groups;
  }, [allPermissions]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaUserShield size={24} color="#34495e" />
          <h1>권한 그룹 관리</h1>
        </TitleGroup>
      </Header>

      <Content>
        <LeftPanel>
          <PanelTitle>
            <span>Roles</span>
            <AddBtn
              onClick={() => {
                setIsEditMode(false);
                setIsModalOpen(true);
              }}
            >
              <FaPlus />
            </AddBtn>
          </PanelTitle>
          <RoleList>
            {roles.map((role) => (
              <RoleCardItem
                key={role.id}
                role={role}
                isActive={selectedRole?.id === role.id}
                onSelect={() => selectRole(role)}
              />
            ))}
          </RoleList>
        </LeftPanel>

        <RightPanel>
          {selectedRole ? (
            <>
              <DetailHeader>
                <div className="info">
                  <h2>{selectedRole.name}</h2>
                  <span className="code">{selectedRole.code}</span>
                  <p>{selectedRole.description}</p>
                </div>
                <div className="actions">
                  <EditBtn
                    onClick={() => {
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                  >
                    <FaEdit /> 수정
                  </EditBtn>
                  {!selectedRole.isSystem && (
                    <DeleteBtn onClick={handleDeleteRole}>
                      <FaTrashAlt /> 삭제
                    </DeleteBtn>
                  )}
                  {isDirty && (
                    <SaveBtn onClick={handleSavePermissions}>
                      <FaSave /> 저장
                    </SaveBtn>
                  )}
                </div>
              </DetailHeader>

              <MatrixArea>
                {/* 그룹별 렌더링 */}
                {Object.keys(groupedPermissions).map((group) => (
                  <PermissionGroup
                    key={group}
                    groupName={group}
                    permissions={groupedPermissions[group]}
                    editedPermissionIds={editedPermissionIds}
                    onToggle={handleTogglePermission}
                    roleIsAdmin={selectedRole.code === "ROLE_ADMIN"}
                  />
                ))}
              </MatrixArea>
            </>
          ) : (
            <EmptyState>역할을 선택해주세요.</EmptyState>
          )}
        </RightPanel>
      </Content>

      <RoleModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        initialData={isEditMode ? selectedRole : null}
        onClose={() => setIsModalOpen(false)}
        onSave={isEditMode ? handleUpdateRole : handleAddRole}
      />
    </Container>
  );
};

export default RolesPage;

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
const Content = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  margin-bottom: 80px;
`;
const LeftPanel = styled.div`
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const PanelTitle = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #333;
`;
const AddBtn = styled.button`
  background: #f0f0f0;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #e0e0e0;
  }
`;
const RoleList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;
const RoleCard = styled.div`
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  background: ${(props) => (props.$active ? "#e8f0fe" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#3498db" : "#eee")};
  &:hover {
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
  color: #666;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 3px;
`;
const CodeBadge = styled.span`
  background: #f8f9fa;
  color: #888;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  border: 1px solid #eee;
`;
const RoleDesc = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.3;
`;
const RightPanel = styled.div`
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
  align-items: flex-start;
  .info h2 {
    margin: 0 0 5px 0;
    font-size: 20px;
    color: #2c3e50;
  }
  .info .code {
    font-family: monospace;
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #555;
  }
  .info p {
    margin: 10px 0 0 0;
    color: #666;
    font-size: 14px;
  }
  .actions {
    display: flex;
    gap: 10px;
  }
`;
const MatrixArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
`;
const SaveBtn = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #219150;
  }
`;
const DeleteBtn = styled.button`
  background: white;
  color: #c0392b;
  border: 1px solid #c0392b;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #fdedec;
  }
`;
const EditBtn = styled.button`
  background: white;
  color: #f39c12;
  border: 1px solid #f39c12;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #fef9e7;
  }
`;
const GroupSection = styled.div`
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
`;
const GroupTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #34495e;
  font-size: 16px;
  border-bottom: 2px solid #3498db;
  display: inline-block;
  padding-bottom: 5px;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
`;
const PermCard = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.$checked ? "#f0f7ff" : "white")};
  border: 1px solid ${(props) => (props.$checked ? "#3498db" : "#eee")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  pointer-events: ${(props) => (props.$disabled ? "none" : "auto")};
  &:hover {
    border-color: #3498db;
  }
`;
const Checkbox = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3px;
  border: 2px solid ${(props) => (props.$checked ? "#3498db" : "#ccc")};
  background: ${(props) => (props.$checked ? "#3498db" : "white")};
`;
const PermInfo = styled.div`
  flex: 1;
`;
const PermName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;
const PermCode = styled.div`
  font-size: 11px;
  color: #999;
  font-family: monospace;
  margin: 2px 0;
`;
const PermDesc = styled.div`
  font-size: 12px;
  color: #666;
`;
const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 16px;
`;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: white;
  width: 450px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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
    cursor: pointer;
    color: #999;
    font-size: 18px;
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
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
  }
  input,
  textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
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
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #2980b9;
  }
`;
const CancelBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #f1f1f1;
  }
`;
