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
  FaBan, // 수정 금지 표시용 아이콘
} from "react-icons/fa";

// ★ 수정/삭제가 불가능한 시스템 역할 목록 정의
const PROTECTED_ROLES = [
  "ROLE_ADMIN",
  "ROLE_OPERATOR",
  "ROLE_PRODUCTION_ADMIN",
];

// --- [서브 컴포넌트] ---

// 1. 역할 카드 (좌측 리스트)
const RoleCardItem = React.memo(({ role, isActive, onSelect }) => {
  // 시스템 역할이거나 보호된 역할이면 뱃지 표시
  const isSystem = role.isSystem || PROTECTED_ROLES.includes(role.code);

  return (
    <RoleCard $active={isActive} onClick={() => onSelect(role)}>
      <RoleHeader>
        <RoleName>{role.name}</RoleName>
        {isSystem ? (
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

// 2. 권한 체크박스 (개별 아이템)
const PermissionItem = React.memo(({ perm, isChecked, onToggle, disabled }) => {
  return (
    <PermCard
      $checked={isChecked}
      $disabled={disabled}
      onClick={() => !disabled && onToggle(perm.id)}
    >
      <Checkbox $checked={isChecked} $disabled={disabled}>
        {isChecked && <FaCheck size={10} color={disabled ? "#aaa" : "white"} />}
      </Checkbox>
      <PermInfo>
        <PermName>{perm.name}</PermName>
        <PermCode>{perm.code}</PermCode>
      </PermInfo>
    </PermCard>
  );
});

// 3. 권한 그룹 (섹션)
const PermissionGroup = React.memo(
  ({ groupName, permissions, editedPermissionIds, onToggle, isReadOnly }) => {
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
              // 보호된 역할이면 비활성화 (클릭 불가)
              disabled={isReadOnly}
            />
          ))}
        </Grid>
      </GroupSection>
    );
  },
);

// 4. 모달 (역할 추가/수정)
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
    if (!form.name || !form.code)
      return alert("필수 입력 항목이 비어있습니다.");
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

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. 데이터 로딩
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
        selectRole(roleList[0], permList); // 초기 로딩 시 첫 번째 역할 선택
      }
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    }
  }, [selectedRole]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, []);

  // 2. 역할 선택 및 자동 체크 로직
  const selectRole = (role, permissions = allPermissions) => {
    setSelectedRole(role);

    let newCheckedIds = [];

    // (1) 최고 관리자: 모든 권한 자동 체크
    if (role.code === "ROLE_ADMIN") {
      newCheckedIds = permissions.map((p) => p.id);
    }
    // (2) 생산 관리자: 생산, 품질, 자재, 설비, 대시보드 관련만 체크
    else if (role.code === "ROLE_PRODUCTION_ADMIN") {
      const targetKeywords = ["생산", "품질", "자재", "설비", "대시보드"];
      newCheckedIds = permissions
        .filter((p) => {
          // 백엔드 필드명 호환성 처리 (groupName, group_name, group)
          const gName = p.groupName || p.group_name || p.group || "";
          return targetKeywords.some((keyword) => gName.includes(keyword));
        })
        .map((p) => p.id);
    }
    // (3) 기타 역할: DB에 저장된 권한 불러오기
    else {
      newCheckedIds = role.permissionIds ? [...role.permissionIds] : [];
    }

    setEditedPermissionIds(newCheckedIds);
    setIsDirty(false);
  };

  // 3. 체크박스 토글 핸들러
  const handleTogglePermission = useCallback((permId) => {
    setEditedPermissionIds((prev) => {
      if (prev.includes(permId)) return prev.filter((id) => id !== permId);
      else return [...prev, permId];
    });
    setIsDirty(true);
  }, []);

  // 4. 권한 저장 (PUT)
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
      alert("권한 설정이 저장되었습니다.");
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  // 5. 역할 추가 (POST)
  const handleAddRole = async (formData) => {
    try {
      const res = await axiosInstance.post("/api/mes/system/role", formData);
      setRoles((prev) => [...prev, res.data]);
      selectRole(res.data);
      setIsModalOpen(false);
      alert("새 역할이 생성되었습니다.");
    } catch (err) {
      alert("생성 실패: " + err.message);
    }
  };

  // 6. 역할 수정 (PUT)
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
      alert("역할 정보가 수정되었습니다.");
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  // 7. 역할 삭제 (DELETE)
  const handleDeleteRole = async () => {
    if (!window.confirm(`'${selectedRole.name}' 역할을 정말 삭제하시겠습니까?`))
      return;
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

  // 8. 권한 그룹핑 로직
  const groupedPermissions = useMemo(() => {
    const groups = {};
    allPermissions.forEach((p) => {
      // DB 컬럼(group_name)과 JSON 변환(groupName) 호환 처리
      const g = p.groupName || p.group_name || p.group || "기타 (Misc)";
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });
    return groups;
  }, [allPermissions]);

  // ★ 현재 선택된 역할이 수정 불가능한지 확인
  const isProtected =
    selectedRole && PROTECTED_ROLES.includes(selectedRole.code);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaUserShield size={24} color="#34495e" />
          <h1>권한 그룹 관리 (Role Management)</h1>
        </TitleGroup>
      </Header>

      <Content>
        {/* === 좌측: 역할 목록 === */}
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
                onSelect={(r) => selectRole(r)}
              />
            ))}
          </RoleList>
        </LeftPanel>

        {/* === 우측: 권한 매트릭스 === */}
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
                  {/* 보호된 역할인 경우: 수정/삭제/저장 버튼 숨김 & 배지 표시 */}
                  {isProtected ? (
                    <ReadOnlyBadge>
                      <FaBan /> 수정 불가 (시스템 기본값)
                    </ReadOnlyBadge>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </DetailHeader>

              <MatrixArea>
                {Object.keys(groupedPermissions).map((group) => (
                  <PermissionGroup
                    key={group}
                    groupName={group}
                    permissions={groupedPermissions[group]}
                    editedPermissionIds={editedPermissionIds}
                    onToggle={handleTogglePermission}
                    // 보호된 역할이면 체크박스 비활성화 (Read-Only)
                    isReadOnly={isProtected}
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

// ★ 수정 불가 배지 스타일
const ReadOnlyBadge = styled.div`
  background: #eee;
  color: #777;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #ddd;
`;
