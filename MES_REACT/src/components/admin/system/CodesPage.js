// src/pages/admin/CodesPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axiosInstance from "../../api/axios";
import {
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaDatabase,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

// --- [Optimized] Sub-Components with React.memo ---

// 1. Group List Item (변경 없음)
const GroupListItem = React.memo(({ group, isActive, onSelect }) => {
  return (
    <GroupItem $active={isActive} onClick={() => onSelect(group)}>
      <IconWrapper>
        {isActive ? (
          <FaFolderOpen color="#3498db" />
        ) : (
          <FaFolder color="#95a5a6" />
        )}
      </IconWrapper>
      <GroupInfo>
        <GroupName>{group.name}</GroupName>
        <GroupDesc>{group.id}</GroupDesc>
      </GroupInfo>
      {group.isSystem && <SystemBadge>Sys</SystemBadge>}
    </GroupItem>
  );
});

// 2. Group List Panel (변경 없음)
const GroupListPanel = React.memo(
  ({ groups, selectedGroupId, onSelectGroup, onAddGroupClick }) => {
    return (
      <LeftPanel>
        <PanelHeader>
          <h3>Code Groups</h3>
          <IconButton onClick={onAddGroupClick} title="Add New Group">
            <FaPlus />
          </IconButton>
        </PanelHeader>
        <GroupList>
          {groups.map((group) => (
            <GroupListItem
              key={group.id}
              group={group}
              isActive={selectedGroupId === group.id}
              onSelect={onSelectGroup}
            />
          ))}
        </GroupList>
      </LeftPanel>
    );
  },
);

// 3. Code Table Row (Inline Edit 기능 추가)
const CodeTableRow = React.memo(
  ({
    code,
    isSystemGroup,
    isEditing, // 현재 행이 수정 모드인지
    editFormData, // 수정 중인 데이터
    onToggleActive,
    onStartEdit, // 수정 시작 핸들러
    onEditChange, // 입력 변경 핸들러
    onSaveEdit, // 저장 핸들러
    onCancelEdit, // 취소 핸들러
  }) => {
    // --- [수정 모드] 렌더링 ---
    if (isEditing) {
      return (
        <tr className="editing">
          <td align="center">
            {/* 수정 모드에서는 Active 스위치 비활성화 혹은 유지 */}
            <ToggleSwitch
              $active={editFormData.isActive}
              style={{ opacity: 0.5 }}
            >
              <div className="knob" />
            </ToggleSwitch>
          </td>
          <td>
            <TableInput
              value={editFormData.code}
              onChange={(e) => onEditChange("code", e.target.value)}
            />
          </td>
          <td>
            <TableInput
              value={editFormData.name}
              onChange={(e) => onEditChange("name", e.target.value)}
            />
          </td>
          <td align="center">
            <TableInput
              type="number"
              width="60px"
              style={{ textAlign: "center" }}
              value={editFormData.sortOrder}
              onChange={(e) => onEditChange("sortOrder", e.target.value)}
            />
          </td>
          <td>
            <ActionBtnGroup>
              <ActionBtn onClick={() => onSaveEdit(code.id)} title="Save">
                <FaCheck color="#2ecc71" />
              </ActionBtn>
              <ActionBtn onClick={onCancelEdit} title="Cancel">
                <FaTimes color="#e74c3c" />
              </ActionBtn>
            </ActionBtnGroup>
          </td>
        </tr>
      );
    }

    // --- [일반 모드] 렌더링 ---
    return (
      <tr className={!code.isActive ? "inactive" : ""}>
        <td align="center">
          <ToggleSwitch
            $active={code.isActive}
            onClick={() => onToggleActive(code.id)}
          >
            <div className="knob" />
          </ToggleSwitch>
        </td>
        <td>
          <CodeTag>{code.code}</CodeTag>
        </td>
        <td>{code.name}</td>
        <td align="center">{code.sortOrder}</td>
        <td>
          <ActionBtnGroup>
            <ActionBtn onClick={() => onStartEdit(code)}>
              <FaEdit />
            </ActionBtn>
            {!isSystemGroup && (
              <ActionBtn className="delete">
                <FaTrashAlt />
              </ActionBtn>
            )}
          </ActionBtnGroup>
        </td>
      </tr>
    );
  },
);

// 4. Code Detail Panel (Props 전달 추가)
const CodeDetailPanel = React.memo(
  ({
    selectedGroup,
    codes,
    searchTerm,
    editingId, // 현재 수정중인 ID
    editFormData, // 현재 수정중인 폼 데이터
    onSearchChange,
    onToggleActive,
    onAddCodeClick,
    onStartEdit,
    onEditChange,
    onSaveEdit,
    onCancelEdit,
  }) => {
    return (
      <RightPanel>
        <PanelHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3>{selectedGroup ? selectedGroup.name : "Select Group"}</h3>
            <SubText>{selectedGroup?.description}</SubText>
          </div>
          <ActionArea>
            <SearchBox>
              <FaSearch color="#aaa" />
              <input
                placeholder="Search code..."
                value={searchTerm}
                onChange={onSearchChange}
              />
            </SearchBox>
            <PrimaryBtn
              onClick={onAddCodeClick}
              disabled={!selectedGroup}
              style={{ opacity: !selectedGroup ? 0.5 : 1 }}
            >
              <FaPlus /> Add Code
            </PrimaryBtn>
          </ActionArea>
        </PanelHeader>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th width="60">Active</th>
                <th width="120">Code</th>
                <th>Code Name</th>
                <th width="80">Sort</th>
                <th width="100">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.length > 0 ? (
                codes.map((code) => (
                  <CodeTableRow
                    key={code.id}
                    code={code}
                    isSystemGroup={selectedGroup?.isSystem}
                    isEditing={editingId === code.id} // 수정 모드 여부 전달
                    editFormData={editFormData} // 폼 데이터 전달
                    onToggleActive={onToggleActive}
                    onStartEdit={onStartEdit}
                    onEditChange={onEditChange}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty">
                    {selectedGroup
                      ? "No codes found in this group."
                      : "Please select a group first."}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </RightPanel>
    );
  },
);

// --- Simple Modal Component (기존 유지) ---
const Modal = ({ isOpen, title, onClose, onSave, children }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay>
      <ModalBox>
        <ModalHeader>
          <h3>{title}</h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="save" onClick={onSave}>
            <FaCheck /> Save
          </button>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
};

// --- Main Component ---

const CodesPage = () => {
  const [groups, setGroups] = useState([]);
  const [allCodes, setAllCodes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // New Data Form States
  const [newGroup, setNewGroup] = useState({ id: "", name: "", desc: "" });
  const [newCode, setNewCode] = useState({ code: "", name: "", sort: 1 });

  // --- [Inline Edit States] ---
  const [editingId, setEditingId] = useState(null); // 현재 수정중인 Row ID
  const [editFormData, setEditFormData] = useState({}); // 수정중인 데이터 임시 저장

  // Data Fetching (Mock)
  useEffect(() => {
    const mockGroups = [
      {
        id: "GRP_COMMON",
        name: "Common Codes",
        description: "General use",
        isSystem: true,
      },
      {
        id: "GRP_USER",
        name: "User Status",
        description: "Member states",
        isSystem: false,
      },
    ];
    const mockCodes = [
      {
        id: 1,
        groupId: "GRP_COMMON",
        code: "Y",
        name: "Yes",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        groupId: "GRP_COMMON",
        code: "N",
        name: "No",
        sortOrder: 2,
        isActive: true,
      },
    ];
    setGroups(mockGroups);
    setAllCodes(mockCodes);
    setSelectedGroup(mockGroups[0]);
  }, []);

  // Filtering Logic
  const currentCodes = useMemo(() => {
    if (!selectedGroup) return [];
    let filtered = allCodes.filter((c) => c.groupId === selectedGroup.id);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(lower) ||
          c.name.toLowerCase().includes(lower),
      );
    }
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedGroup, allCodes, searchTerm]);

  // General Handlers
  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(group);
    setSearchTerm("");
    setEditingId(null); // 그룹 변경 시 수정 모드 초기화
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleToggleActive = useCallback((codeId) => {
    setAllCodes((prevCodes) =>
      prevCodes.map((c) =>
        c.id === codeId ? { ...c, isActive: !c.isActive } : c,
      ),
    );
  }, []);

  // --- [Inline Editing Handlers] ---

  // 1. 수정 시작 (Edit 버튼 클릭)
  const handleStartEdit = useCallback((code) => {
    setEditingId(code.id);
    setEditFormData({ ...code }); // 현재 데이터를 폼 데이터로 복사
  }, []);

  // 2. 입력 값 변경
  const handleEditChange = useCallback((field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // 3. 수정 취소
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditFormData({});
  }, []);

  // 4. 저장 (Save 버튼 클릭)
  const handleSaveEdit = useCallback(
    (codeId) => {
      if (!editFormData.code || !editFormData.name) {
        alert("Code and Name are required.");
        return;
      }

      setAllCodes((prevCodes) =>
        prevCodes.map((c) =>
          c.id === codeId
            ? { ...editFormData, sortOrder: Number(editFormData.sortOrder) }
            : c,
        ),
      );
      setEditingId(null); // 수정 모드 종료
    },
    [editFormData],
  );

  // --- Add Data Handlers (기존 유지) ---
  const openGroupModal = () => {
    setNewGroup({ id: "", name: "", desc: "" });
    setIsGroupModalOpen(true);
  };

  const saveGroup = () => {
    if (!newGroup.id || !newGroup.name) {
      alert("Please fill in ID and Name.");
      return;
    }
    if (groups.some((g) => g.id === newGroup.id)) {
      alert("Group ID already exists.");
      return;
    }
    const newGroupData = {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.desc,
      isSystem: false,
    };
    setGroups([...groups, newGroupData]);
    setSelectedGroup(newGroupData);
    setIsGroupModalOpen(false);
  };

  const openCodeModal = () => {
    if (!selectedGroup) return;
    setNewCode({ code: "", name: "", sort: 1 });
    setIsCodeModalOpen(true);
  };

  const saveCode = () => {
    if (!newCode.code || !newCode.name) {
      alert("Please fill in Code and Name.");
      return;
    }
    const newCodeData = {
      id: Date.now(),
      groupId: selectedGroup.id,
      code: newCode.code,
      name: newCode.name,
      sortOrder: parseInt(newCode.sort),
      isActive: true,
    };
    setAllCodes([...allCodes, newCodeData]);
    setIsCodeModalOpen(false);
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaDatabase size={22} color="#34495e" />
          <h1>Common Code Management</h1>
        </TitleGroup>
      </Header>

      <SplitView>
        <GroupListPanel
          groups={groups}
          selectedGroupId={selectedGroup?.id}
          onSelectGroup={handleGroupSelect}
          onAddGroupClick={openGroupModal}
        />

        <CodeDetailPanel
          selectedGroup={selectedGroup}
          codes={currentCodes}
          searchTerm={searchTerm}
          // Inline Edit Props 전달
          editingId={editingId}
          editFormData={editFormData}
          onStartEdit={handleStartEdit}
          onEditChange={handleEditChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onSearchChange={handleSearchChange}
          onToggleActive={handleToggleActive}
          onAddCodeClick={openCodeModal}
        />
      </SplitView>

      {/* --- Modals (기존과 동일) --- */}
      <Modal
        isOpen={isGroupModalOpen}
        title="Add Code Group"
        onClose={() => setIsGroupModalOpen(false)}
        onSave={saveGroup}
      >
        <FormGroup>
          <label>Group ID (Unique)</label>
          <Input
            value={newGroup.id}
            onChange={(e) => setNewGroup({ ...newGroup, id: e.target.value })}
            placeholder="e.g. GRP_MEMBER"
          />
        </FormGroup>
        <FormGroup>
          <label>Group Name</label>
          <Input
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="e.g. Member Types"
          />
        </FormGroup>
        <FormGroup>
          <label>Description</label>
          <Input
            value={newGroup.desc}
            onChange={(e) => setNewGroup({ ...newGroup, desc: e.target.value })}
            placeholder="Optional description"
          />
        </FormGroup>
      </Modal>

      <Modal
        isOpen={isCodeModalOpen}
        title={`Add Code to ${selectedGroup?.name}`}
        onClose={() => setIsCodeModalOpen(false)}
        onSave={saveCode}
      >
        <FormGroup>
          <label>Code Value</label>
          <Input
            value={newCode.code}
            onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
            placeholder="e.g. 01, M, KR"
          />
        </FormGroup>
        <FormGroup>
          <label>Code Name</label>
          <Input
            value={newCode.name}
            onChange={(e) => setNewCode({ ...newCode, name: e.target.value })}
            placeholder="e.g. Male, Korea"
          />
        </FormGroup>
        <FormGroup>
          <label>Sort Order</label>
          <Input
            type="number"
            value={newCode.sort}
            onChange={(e) => setNewCode({ ...newCode, sort: e.target.value })}
          />
        </FormGroup>
      </Modal>
    </Container>
  );
};

export default CodesPage;

// --- Styled Components (Updated) ---

// ... (기존 스타일 유지) ...

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

const SplitView = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
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

const GroupList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 5px;
  background: ${(props) => (props.$active ? "#e8f0fe" : "transparent")};
  border: 1px solid ${(props) => (props.$active ? "#3498db" : "transparent")};

  &:hover {
    background: ${(props) => (props.$active ? "#e8f0fe" : "#f8f9fa")};
  }
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const GroupInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const GroupName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GroupDesc = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;

const SystemBadge = styled.span`
  font-size: 10px;
  background: #eee;
  color: #666;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: bold;
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

const SubText = styled.span`
  font-size: 13px;
  color: #888;
  margin-left: 10px;
  border-left: 1px solid #ddd;
  padding-left: 10px;
`;

const ActionArea = styled.div`
  display: flex;
  gap: 10px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;

  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    outline: none;
    font-size: 13px;
    width: 150px;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  thead {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #fcfcfc;
  }

  th {
    text-align: left;
    background: #fcfcfc;
    padding: 12px 20px;
    font-size: 12px;
    color: #888;
    border-bottom: 1px solid #eee;
  }

  td {
    padding: 12px 20px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 14px;
    color: #333;
    vertical-align: middle;
  }

  /* Editing Row Style */
  tr.editing td {
    background: #fdfdfd;
    border-bottom: 1px solid #3498db;
  }

  tr.inactive td {
    color: #aaa;
    background: #fdfdfd;
  }

  td.empty {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
`;

const CodeTag = styled.span`
  font-family: monospace;
  background: #eff3f8;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
`;

const ToggleSwitch = styled.div`
  width: 36px;
  height: 20px;
  background: ${(props) => (props.$active ? "#2ecc71" : "#ddd")};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;

  .knob {
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: ${(props) => (props.$active ? "18px" : "2px")};
    transition: left 0.3s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const ActionBtnGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  color: #7f8c8d;
  padding: 5px;
  border-radius: 4px;
  &:hover {
    background: #eee;
    color: #333;
  }
  &.delete:hover {
    background: #fee;
    color: #e74c3c;
  }
`;

const IconButton = styled.button`
  border: 1px solid #ddd;
  background: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: all 0.2s;
  &:hover {
    background: #f0f0f0;
    border-color: #bbb;
    color: #333;
  }
`;

const PrimaryBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 0 16px;
  height: 34px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  &:hover {
    background: #133b6b;
  }
  &:disabled {
    background: #9aaec4;
    cursor: not-allowed;
  }
`;

// --- [New] Table Inline Input ---
const TableInput = styled.input`
  width: ${(props) => props.width || "100%"};
  padding: 6px 8px;
  border: 1px solid #3498db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  box-sizing: border-box;

  &:focus {
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// ... Modal Styled Components (기존 유지) ...
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
const ModalBox = styled.div`
  background: white;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s;
  @keyframes slideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
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
    color: #333;
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #999;
    &:hover {
      color: #555;
    }
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
  border-top: 1px solid #eee;
  border-radius: 0 0 8px 8px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cancel {
    background: white;
    border: 1px solid #ddd;
    color: #555;
    &:hover {
      background: #f0f0f0;
    }
  }
  .save {
    background: #1a4f8b;
    color: white;
    &:hover {
      background: #133b6b;
    }
  }
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  label {
    font-size: 12px;
    color: #666;
    font-weight: 600;
  }
`;
const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;
