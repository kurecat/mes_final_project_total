// src/pages/system/CodesPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaFolder,
  FaFolderOpen,
  FaTag,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

// --- Mock Data ---
// 1. 코드 그룹 (Master)
const CODE_GROUPS = [
  {
    id: "DEFECT_TYPE",
    name: "불량 유형 코드",
    desc: "공정 불량 분류 기준",
    useYn: "Y",
  },
  {
    id: "UNIT_TYPE",
    name: "단위 코드 (Unit)",
    desc: "자재 및 제품 수량 단위",
    useYn: "Y",
  },
  {
    id: "MAT_TYPE",
    name: "자재 유형",
    desc: "원자재, 부자재, 반제품 구분",
    useYn: "Y",
  },
  {
    id: "EQ_STATUS",
    name: "설비 상태 코드",
    desc: "가동, 비가동, 고장 등",
    useYn: "Y",
  },
  {
    id: "PROCESS_TYPE",
    name: "공정 구분",
    desc: "세정, 가공, 검사 등",
    useYn: "Y",
  },
];

// 2. 상세 코드 (Detail)
const CODE_DETAILS = [
  // 불량 유형
  {
    groupId: "DEFECT_TYPE",
    code: "DF_001",
    name: "Scratch",
    sort: 1,
    useYn: "Y",
    desc: "표면 긁힘",
  },
  {
    groupId: "DEFECT_TYPE",
    code: "DF_002",
    name: "Void",
    sort: 2,
    useYn: "Y",
    desc: "내부 기포 발생",
  },
  {
    groupId: "DEFECT_TYPE",
    code: "DF_003",
    name: "Crack",
    sort: 3,
    useYn: "Y",
    desc: "칩 깨짐",
  },
  {
    groupId: "DEFECT_TYPE",
    code: "DF_004",
    name: "Contamination",
    sort: 4,
    useYn: "N",
    desc: "이물질 오염 (사용 중지)",
  },

  // 단위
  {
    groupId: "UNIT_TYPE",
    code: "EA",
    name: "Each (개)",
    sort: 1,
    useYn: "Y",
    desc: "낱개 단위",
  },
  {
    groupId: "UNIT_TYPE",
    code: "KG",
    name: "Kilogram",
    sort: 2,
    useYn: "Y",
    desc: "중량 단위",
  },
  {
    groupId: "UNIT_TYPE",
    code: "L",
    name: "Liter",
    sort: 3,
    useYn: "Y",
    desc: "액체 부피",
  },
];

const CodesPage = () => {
  const [groups, setGroups] = useState(CODE_GROUPS);
  const [details, setDetails] = useState(CODE_DETAILS);

  const [selectedGroup, setSelectedGroup] = useState(CODE_GROUPS[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("DETAIL"); // GROUP or DETAIL
  const [formData, setFormData] = useState({});

  // 필터링된 그룹 목록
  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택된 그룹의 상세 코드 목록
  const currentDetails = details.filter((d) => d.groupId === selectedGroup.id);

  // 모달 열기
  const openModal = (type, data = null) => {
    setModalType(type);
    if (data) {
      setFormData(data); // 수정 모드
    } else {
      // 추가 모드 (초기값)
      setFormData(
        type === "GROUP"
          ? { id: "", name: "", desc: "", useYn: "Y" }
          : {
              groupId: selectedGroup.id,
              code: "",
              name: "",
              sort: currentDetails.length + 1,
              useYn: "Y",
              desc: "",
            }
      );
    }
    setIsModalOpen(true);
  };

  // 저장 핸들러 (Mock)
  const handleSave = () => {
    if (modalType === "GROUP") {
      // 그룹 저장 로직 (중복 체크 생략)
      const exists = groups.find((g) => g.id === formData.id);
      if (exists) {
        setGroups(groups.map((g) => (g.id === formData.id ? formData : g)));
      } else {
        setGroups([...groups, formData]);
      }
    } else {
      // 상세 코드 저장 로직
      const exists = details.find(
        (d) => d.code === formData.code && d.groupId === formData.groupId
      );
      if (exists) {
        setDetails(
          details.map((d) =>
            d.code === formData.code && d.groupId === formData.groupId
              ? formData
              : d
          )
        );
      } else {
        setDetails([...details, formData]);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <Container>
      {/* 1. 좌측: 코드 그룹 목록 (Master) */}
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaFolderOpen /> Code Groups
          </Title>
          <SearchBox>
            <FaSearch color="#aaa" />
            <input
              placeholder="Search Group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton onClick={() => openModal("GROUP")}>
            <FaPlus /> New Group
          </AddButton>
        </SidebarHeader>

        <GroupList>
          {filteredGroups.map((group) => (
            <GroupItem
              key={group.id}
              $active={selectedGroup.id === group.id}
              onClick={() => setSelectedGroup(group)}
            >
              <GroupIcon>
                {selectedGroup.id === group.id ? (
                  <FaFolderOpen />
                ) : (
                  <FaFolder />
                )}
              </GroupIcon>
              <GroupInfo>
                <GroupName>{group.name}</GroupName>
                <GroupId>{group.id}</GroupId>
              </GroupInfo>
              <StatusDot $active={group.useYn === "Y"} />
            </GroupItem>
          ))}
        </GroupList>
      </Sidebar>

      {/* 2. 우측: 상세 코드 목록 (Detail) */}
      <ContentArea>
        <HeaderSection>
          <HeaderLeft>
            <HeaderTitle>
              <FaTag /> {selectedGroup.name}
              <SubText>({selectedGroup.id})</SubText>
            </HeaderTitle>
            <HeaderDesc>{selectedGroup.desc}</HeaderDesc>
          </HeaderLeft>
          <HeaderRight>
            <SmallButton onClick={() => openModal("GROUP", selectedGroup)}>
              <FaEdit /> Edit Group
            </SmallButton>
            <AddDetailButton onClick={() => openModal("DETAIL")}>
              <FaPlus /> Add Code
            </AddDetailButton>
          </HeaderRight>
        </HeaderSection>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th width="15%">Code</th>
                <th width="20%">Code Name</th>
                <th width="10%">Sort</th>
                <th width="35%">Description</th>
                <th width="10%">Use Y/N</th>
                <th width="10%">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDetails.length > 0 ? (
                currentDetails.map((detail) => (
                  <tr key={detail.code}>
                    <td className="mono">{detail.code}</td>
                    <td className="bold">{detail.name}</td>
                    <td align="center">{detail.sort}</td>
                    <td>{detail.desc}</td>
                    <td align="center">
                      <UseBadge $use={detail.useYn === "Y"}>
                        {detail.useYn === "Y" ? "Active" : "Inactive"}
                      </UseBadge>
                    </td>
                    <td align="center">
                      <ActionIcon onClick={() => openModal("DETAIL", detail)}>
                        <FaEdit />
                      </ActionIcon>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    align="center"
                    style={{ padding: "40px", color: "#999" }}
                  >
                    No codes registered in this group.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </ContentArea>

      {/* 3. 모달 (공통 사용) */}
      {isModalOpen && (
        <Overlay>
          <ModalBox>
            <ModalHeader>
              <h3>
                {modalType === "GROUP" ? "Code Group" : "Detail Code"}{" "}
                {formData.code || formData.id ? "Edit" : "Registration"}
              </h3>
              <CloseBtn onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              {modalType === "GROUP" ? (
                // 그룹 입력 폼
                <>
                  <FormGroup>
                    <Label>Group ID (Code)</Label>
                    <Input
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      placeholder="e.g. DEFECT_TYPE"
                      disabled={
                        formData.id && groups.some((g) => g.id === formData.id)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Group Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. 불량 유형"
                    />
                  </FormGroup>
                </>
              ) : (
                // 상세 코드 입력 폼
                <>
                  <FormGroup>
                    <Label>Detail Code</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g. DF_001"
                      disabled={details.some(
                        (d) =>
                          d.code === formData.code &&
                          d.groupId === formData.groupId
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Code Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Scratch"
                    />
                  </FormGroup>
                  <Row>
                    <FormGroup>
                      <Label>Sort Order</Label>
                      <Input
                        type="number"
                        value={formData.sort}
                        onChange={(e) =>
                          setFormData({ ...formData, sort: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Use Y/N</Label>
                      <Select
                        value={formData.useYn}
                        onChange={(e) =>
                          setFormData({ ...formData, useYn: e.target.value })
                        }
                      >
                        <option value="Y">Active (Y)</option>
                        <option value="N">Inactive (N)</option>
                      </Select>
                    </FormGroup>
                  </Row>
                </>
              )}

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  rows="3"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button $primary onClick={handleSave}>
                <FaSave /> Save
              </Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </Container>
  );
};

export default CodesPage;

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
  width: 300px;
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

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  input {
    border: none;
    background: transparent;
    margin-left: 8px;
    width: 100%;
    outline: none;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background: white;
  color: #1a4f8b;
  border: 1px solid #1a4f8b;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    background: #e3f2fd;
  }
`;

const GroupList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const GroupItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${(props) => (props.$active ? "#eef2f8" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};

  &:hover {
    background-color: #f9f9f9;
  }
`;

const GroupIcon = styled.div`
  color: #f39c12; /* Folder Color */
  font-size: 18px;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const GroupId = styled.div`
  font-size: 11px;
  color: #888;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#2ecc71" : "#ccc")};
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubText = styled.span`
  font-size: 14px;
  color: #1a4f8b;
  font-family: monospace;
`;

const HeaderDesc = styled.div`
  margin-top: 5px;
  font-size: 13px;
  color: #666;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const SmallButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid #ddd;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: #f5f5f5;
  }
`;

const AddDetailButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  background: #1a4f8b;
  border: 1px solid #1a4f8b;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  &:hover {
    background: #133b6b;
  }
`;

const TableContainer = styled.div`
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
    th {
      padding: 12px;
      text-align: left;
      font-weight: 700;
      color: #555;
      border-bottom: 1px solid #ddd;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 12px;
      color: #333;
      font-size: 14px;
      vertical-align: middle;

      &.mono {
        font-family: monospace;
        color: #1a4f8b;
      }
      &.bold {
        font-weight: 600;
      }
    }
    tr:hover {
      background-color: #f8fbff;
    }
  }
`;

const UseBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background-color: ${(props) => (props.$use ? "#e8f5e9" : "#ffebee")};
  color: ${(props) => (props.$use ? "#2e7d32" : "#c62828")};
`;

const ActionIcon = styled.button`
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  &:hover {
    color: #1a4f8b;
  }
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  width: 450px;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 15px;
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
  &:focus {
    border-color: #1a4f8b;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  resize: none;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#555")};

  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    opacity: 0.9;
  }
`;
