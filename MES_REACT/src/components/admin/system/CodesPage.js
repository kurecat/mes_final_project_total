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
} from "react-icons/fa";

// --- [Optimized] Sub-Components with React.memo ---

// 1. Group List Item
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

// 2. Group List Panel
const GroupListPanel = React.memo(
  ({ groups, selectedGroupId, onSelectGroup }) => {
    return (
      <LeftPanel>
        <PanelHeader>
          <h3>Code Groups</h3>
          <IconButton>
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

// 3. Code Table Row
const CodeTableRow = React.memo(({ code, isSystemGroup, onToggleActive }) => {
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
          <ActionBtn>
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
});

// 4. Code Detail Panel
const CodeDetailPanel = React.memo(
  ({ selectedGroup, codes, searchTerm, onSearchChange, onToggleActive }) => {
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
            <PrimaryBtn>
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
                    onToggleActive={onToggleActive}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty">
                    No codes found in this group.
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

// --- Main Component ---

const CodesPage = () => {
  const [groups, setGroups] = useState([]);
  const [allCodes, setAllCodes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:3001";
        const [grpRes, codeRes] = await Promise.all([
          fetch(`${baseUrl}/codeGroups`),
          fetch(`${baseUrl}/commonCodes`),
        ]);

        const grpData = await grpRes.json();
        const codeData = await codeRes.json();

        setGroups(grpData);
        setAllCodes(codeData);

        if (grpData.length > 0) setSelectedGroup(grpData[0]);
      } catch (err) {
        console.error("Failed to load codes:", err);
      }
    };
    fetchData();
  }, []);

  // Filtering Logic (useMemo)
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

  // Handlers (useCallback)
  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(group);
    setSearchTerm("");
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

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaDatabase size={22} color="#34495e" />
          <h1>Common Code Management</h1>
        </TitleGroup>
      </Header>

      <SplitView>
        {/* Left Panel (Memoized) */}
        <GroupListPanel
          groups={groups}
          selectedGroupId={selectedGroup?.id}
          onSelectGroup={handleGroupSelect}
        />

        {/* Right Panel (Memoized) */}
        <CodeDetailPanel
          selectedGroup={selectedGroup}
          codes={currentCodes}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onToggleActive={handleToggleActive}
        />
      </SplitView>
    </Container>
  );
};

export default CodesPage;

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
  &:hover {
    background: #f5f5f5;
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
  &:hover {
    background: #133b6b;
  }
`;
