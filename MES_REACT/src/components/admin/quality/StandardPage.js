// src/pages/doc/StandardPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaFilePdf,
  FaHistory,
  FaFileAlt,
  FaFilter,
  FaCloudDownloadAlt,
  FaTimes,
  FaCheckCircle,
  FaBan,
  FaPenNib,
} from "react-icons/fa";

const StandardPage = () => {
  // --- State ---
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState(null); // For Modal

  // --- Fetch Data ---
  useEffect(() => {
    fetch("http://localhost:3001/standards")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error fetching standards:", err));
  }, []);

  // --- Filtering ---
  const filteredDocs = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      categoryFilter === "ALL" || doc.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // --- Helpers ---
  const getStatusIcon = (status) => {
    if (status === "ACTIVE") return <FaCheckCircle color="#2ecc71" />;
    if (status === "DRAFT") return <FaPenNib color="#f39c12" />;
    return <FaBan color="#95a5a6" />;
  };

  const getStatusColor = (status) => {
    if (status === "ACTIVE") return "bg-green-100 text-green-800"; // Tailwind stlye logic
    if (status === "DRAFT") return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaFileAlt size={24} color="#34495e" />
          <h1>Standard Documents (SOP)</h1>
        </TitleGroup>
        <ActionGroup>
          <FilterSelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Process">Process</option>
            <option value="Equipment">Equipment</option>
            <option value="Quality">Quality</option>
            <option value="Safety">Safety</option>
          </FilterSelect>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Title or Doc ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </ActionGroup>
      </Header>

      {/* Main Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="120">Doc ID</th>
              <th>Document Title</th>
              <th width="100">Category</th>
              <th width="80">Rev</th>
              <th width="100">Status</th>
              <th width="150">Owner</th>
              <th width="120">Updated</th>
              <th width="100">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr key={doc.id} onClick={() => setSelectedDoc(doc)}>
                <DocIdCell>{doc.id}</DocIdCell>
                <TitleCell>
                  <FaFilePdf color="#e74c3c" style={{ marginRight: 8 }} />
                  {doc.title}
                </TitleCell>
                <td>
                  <CategoryBadge>{doc.category}</CategoryBadge>
                </td>
                <td>{doc.revision}</td>
                <td>
                  <StatusBadge $status={doc.status}>
                    {getStatusIcon(doc.status)}
                    <span>{doc.status}</span>
                  </StatusBadge>
                </td>
                <td>{doc.owner}</td>
                <td>{doc.updatedAt}</td>
                <td>
                  <ViewBtn>View Detail</ViewBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Detail Modal */}
      {selectedDoc && (
        <Overlay onClick={() => setSelectedDoc(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{selectedDoc.title}</h2>
              <CloseBtn onClick={() => setSelectedDoc(null)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>

            <ModalBody>
              <InfoSection>
                <InfoItem>
                  <label>Document ID</label>
                  <span>{selectedDoc.id}</span>
                </InfoItem>
                <InfoItem>
                  <label>Current Revision</label>
                  <span>{selectedDoc.revision}</span>
                </InfoItem>
                <InfoItem>
                  <label>Status</label>
                  <StatusBadge $status={selectedDoc.status}>
                    {selectedDoc.status}
                  </StatusBadge>
                </InfoItem>
                <InfoItem>
                  <label>Owner</label>
                  <span>{selectedDoc.owner}</span>
                </InfoItem>
              </InfoSection>

              <DescriptionBox>
                <h4>Description</h4>
                <p>{selectedDoc.description}</p>
              </DescriptionBox>

              <HistorySection>
                <h4>
                  <FaHistory /> Revision History
                </h4>
                <HistoryTable>
                  <thead>
                    <tr>
                      <th>Rev</th>
                      <th>Date</th>
                      <th>Author</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoc.revisions &&
                    selectedDoc.revisions.length > 0 ? (
                      selectedDoc.revisions.map((rev, idx) => (
                        <tr key={idx}>
                          <td>
                            <b>{rev.rev}</b>
                          </td>
                          <td>{rev.date}</td>
                          <td>{rev.author}</td>
                          <td>{rev.comment}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No history available.</td>
                      </tr>
                    )}
                  </tbody>
                </HistoryTable>
              </HistorySection>
            </ModalBody>

            <ModalFooter>
              <DownloadBtn>
                <FaCloudDownloadAlt /> Download PDF
              </DownloadBtn>
            </ModalFooter>
          </ModalContent>
        </Overlay>
      )}
    </Container>
  );
};

export default StandardPage;

// --- Styled Components ---

// 1. 컨테이너: 100vh 대신 100%를 사용하여 부모 레이아웃(메인 영역)에 맞춤
const Container = styled.div`
  width: 100%;
  height: 100%; /* 부모 높이를 꽉 채움 */
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box; /* 패딩 포함 크기 계산 */
  overflow: hidden; /* 전체 화면 스크롤 방지 */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0; /* 헤더가 찌그러지지 않도록 고정 */
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

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  input {
    border: none;
    margin-left: 8px;
    outline: none;
    font-size: 14px;
    width: 200px;
  }
`;

// 2. 테이블 컨테이너: 남은 공간을 모두 차지하고 내부에서만 스크롤 발생
const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex: 1; /* 남은 공간 모두 차지 */
  overflow: auto; /* 내용이 넘치면 이 안에서만 스크롤 */
  display: flex;
  flex-direction: column;
`;

// 3. 테이블: 텍스트 줄바꿈 방지 및 헤더 고정 (선택 사항)
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 (깔끔하게 보임) */

  thead {
    position: sticky; /* 헤더 고정 */
    top: 0;
    z-index: 10;
    background: #f8f9fa; /* 헤더 배경색 지정 필수 */
  }

  th {
    background: #f8f9fa;
    padding: 15px;
    text-align: left;
    font-size: 13px;
    color: #666;
    border-bottom: 2px solid #eee;
    font-weight: 600;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #333;
    vertical-align: middle;
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
      background: #f1f2f6;
    }
  }
`;

const DocIdCell = styled.td`
  font-family: monospace;
  font-weight: bold;
  color: #34495e !important;
`;

const TitleCell = styled.td`
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const CategoryBadge = styled.span`
  background: #e8f0fe;
  color: #1967d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
    props.$status === "ACTIVE"
      ? "#e8f5e9"
      : props.$status === "DRAFT"
      ? "#fff3e0"
      : "#f5f5f5"};
  color: ${(props) =>
    props.$status === "ACTIVE"
      ? "#2ecc71"
      : props.$status === "DRAFT"
      ? "#f39c12"
      : "#95a5a6"};
`;

const ViewBtn = styled.button`
  border: 1px solid #ddd;
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
  }
`;

// --- Modal Styles (그대로 유지) ---
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

const ModalContent = styled.div`
  background: white;
  width: 600px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 20px;
    color: #2c3e50;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }
  span {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
`;

const DescriptionBox = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  h4 {
    margin: 0 0 5px 0;
    font-size: 14px;
    color: #555;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
`;

const HistorySection = styled.div`
  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th {
    text-align: left;
    background: #eee;
    padding: 8px;
    color: #555;
  }
  td {
    border-bottom: 1px solid #eee;
    padding: 8px;
    color: #333;
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const DownloadBtn = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  &:hover {
    background: #133b6b;
  }
`;
