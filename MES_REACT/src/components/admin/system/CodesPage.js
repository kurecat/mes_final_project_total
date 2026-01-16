// src/pages/admin/CodesPage.js
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  FaFolder,
  FaFolderOpen,
  FaTag,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaCheck,
  FaDatabase,
} from "react-icons/fa";

const CodesPage = () => {
  // --- State ---
  const [groups, setGroups] = useState([]);
  const [allCodes, setAllCodes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching ---
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

        // Default selection
        if (grpData.length > 0) setSelectedGroup(grpData[0]);
      } catch (err) {
        console.error("Failed to load codes:", err);
      }
    };
    fetchData();
  }, []);

  // --- Filtering Logic ---
  const currentCodes = useMemo(() => {
    if (!selectedGroup) return [];

    // 1. Filter by Group
    let filtered = allCodes.filter((c) => c.groupId === selectedGroup.id);

    // 2. Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(lower) ||
          c.name.toLowerCase().includes(lower)
      );
    }

    // 3. Sort by SortOrder
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedGroup, allCodes, searchTerm]);

  // --- Handlers (Mock UI Only) ---
  const handleToggleActive = (codeId) => {
    // In real app: PUT API request here
    const updated = allCodes.map((c) =>
      c.id === codeId ? { ...c, isActive: !c.isActive } : c
    );
    setAllCodes(updated);
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
        {/* Left Panel: Code Groups */}
        <LeftPanel>
          <PanelHeader>
            <h3>Code Groups</h3>
            <IconButton>
              <FaPlus />
            </IconButton>
          </PanelHeader>
          <GroupList>
            {groups.map((group) => (
              <GroupItem
                key={group.id}
                $active={selectedGroup?.id === group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  setSearchTerm(""); // Reset search on group change
                }}
              >
                <IconWrapper>
                  {selectedGroup?.id === group.id ? (
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
            ))}
          </GroupList>
        </LeftPanel>

        {/* Right Panel: Detail Codes */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {currentCodes.length > 0 ? (
                  currentCodes.map((code) => (
                    <tr
                      key={code.id}
                      className={!code.isActive ? "inactive" : ""}
                    >
                      <td align="center">
                        <ToggleSwitch
                          $active={code.isActive}
                          onClick={() => handleToggleActive(code.id)}
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
                          {!selectedGroup?.isSystem && (
                            <ActionBtn className="delete">
                              <FaTrashAlt />
                            </ActionBtn>
                          )}
                        </ActionBtnGroup>
                      </td>
                    </tr>
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
      </SplitView>
    </Container>
  );
};

export default CodesPage;

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

// 2. 분할 뷰: 남은 높이를 모두 차지하며, 내부 스크롤을 위해 overflow 제어
const SplitView = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0; /* Flex 자식 요소 스크롤 버그 방지 */
`;

// Left Panel
const LeftPanel = styled.div`
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 패널 자체는 스크롤 안 됨 */
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
  overflow-y: auto; /* 리스트만 스크롤 */
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

// Right Panel
const RightPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 패널 자체 스크롤 방지 */
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
  overflow: auto; /* 테이블 영역만 스크롤 */
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap; /* 줄바꿈 방지 */

  thead {
    position: sticky; /* 헤더 고정 */
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
