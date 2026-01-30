// src/pages/doc/StandardPage.js
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";
// ★ PDF 생성 라이브러리
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Dicing from "../../../pdf/Dicing.pdf";
import DieBonding from "../../../pdf/DieBonding.pdf";
import WireBonding from "../../../pdf/WireBonding.pdf";
import Molding from "../../../pdf/Molding.pdf";
import FinalInspection from "../../../pdf/FinalInspection.pdf";

import {
  FaSearch,
  FaFilePdf,
  FaHistory,
  FaFileAlt,
  FaCloudDownloadAlt,
  FaTimes,
  FaCheckCircle,
  FaBan,
  FaPenNib,
  FaEye,
  FaUpload,
} from "react-icons/fa";

const SAMPLE_PDF_BASE64 =
  "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgNTk1LjI4IDg0MS44OSBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDcwMCBURAovRjEgMjQgVGYKKFRoaXMgaXMgYSBTYW1wbGUgUERGKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTU3IDAwMDAwIG4gCjAwMDAwMDAyNTUgMDAwMDAgbiAKMDAwMDAwMDM0NCAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MzkKJSVFT0YK";

// --- Mock Data ---
const MOCK_STANDARDS = [
  {
    id: "STD-QC-01",
    title: "Dicing 공정 검사 기준서",
    category: "Quality",
    revision: "Rev 1.0",
    status: "ACTIVE",
    owner: "품질관리팀",
    updatedAt: "2024-01-15",
    description:
      "Dicing 공정 완료 후 품질 검사 기준입니다.\n1) 샘플링 수량 : 50 EA\n2) 검사 기준 : 두께 ±5μm, 칩핑(Chipping) 없음",
    fileUrl: Dicing,
    revisions: [
      {
        rev: "1.0",
        date: "2024-01-15",
        author: "박품질",
        comment: "최초 제정",
      },
    ],
  },
  {
    id: "STD-QC-02",
    title: "DieBonding 공정 검사 기준서",
    category: "Quality",
    revision: "Rev 1.2",
    status: "ACTIVE",
    owner: "품질관리팀",
    updatedAt: "2024-01-20",
    description:
      "Die Attach 공정 품질 검사 기준입니다.\n1) 샘플링 수량 : 40 EA\n2) 검사 기준 : 정렬 오차 ±2μm, 보이드(Void) 없음",
    fileUrl: DieBonding,
    revisions: [
      {
        rev: "1.2",
        date: "2024-01-20",
        author: "김엔지니어",
        comment: "샘플링 수량 조정",
      },
    ],
  },
  {
    id: "STD-QC-03",
    title: "WireBonding 공정 검사 기준서",
    category: "Quality",
    revision: "Rev 2.0",
    status: "ACTIVE",
    owner: "품질관리팀",
    updatedAt: "2024-02-01",
    description:
      "Wire Bonding 연결 상태 검사 기준입니다.\n1) 샘플링 수량 : 60 EA\n2) 검사 기준 : 본딩 강도 ≥7g, 전기적 쇼트 없음",
    fileUrl: WireBonding,
    revisions: [
      {
        rev: "2.0",
        date: "2024-02-01",
        author: "이QC",
        comment: "본딩 강도 기준 상향",
      },
    ],
  },
  {
    id: "STD-QC-04",
    title: "Molding 공정 검사 기준서",
    category: "Quality",
    revision: "Rev 1.0",
    status: "DRAFT",
    owner: "생산1팀",
    updatedAt: "2024-03-10",
    description:
      "패키지 Molding 외관 및 치수 검사 기준입니다.\n1) 샘플링 수량 : 30 EA\n2) 검사 기준 : 두께 ±10μm, 내부 기포/크랙 없음",
    fileUrl: Molding,
    revisions: [],
  },
  {
    id: "STD-QC-05",
    title: "Final Inspection (최종 검사) 기준서",
    category: "Quality",
    revision: "Rev 3.5",
    status: "ACTIVE",
    owner: "최종검사팀",
    updatedAt: "2024-04-05",
    description:
      "제품 출하 전 최종 Item 단위 검사 기준입니다.\n1) 전기적 검사 (Electrical Test)\n2) 신뢰성 검사 (Reliability)\n3) 외관 검사 (Visual Inspection)",
    fileUrl: FinalInspection,
    revisions: [
      {
        rev: "3.5",
        date: "2024-04-05",
        author: "최팀장",
        comment: "신뢰성 검사 항목 추가",
      },
    ],
  },
];

// --- Helper Functions ---
const getStatusIcon = (status) => {
  if (status === "ACTIVE") return <FaCheckCircle color="#2ecc71" />;
  if (status === "DRAFT") return <FaPenNib color="#f39c12" />;
  return <FaBan color="#95a5a6" />;
};

// --- Sub-Components ---

// 1. Header Component
const StandardHeader = React.memo(
  ({
    categoryFilter,
    onCategoryChange,
    searchTerm,
    onSearchChange,
    onOpenUpload,
  }) => {
    return (
      <Header>
        <TitleGroup>
          <FaFileAlt size={24} color="#34495e" />
          <h1>Standard Documents (SOP)</h1>
        </TitleGroup>
        <ActionGroup>
          <FilterSelect value={categoryFilter} onChange={onCategoryChange}>
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
              onChange={onSearchChange}
            />
          </SearchBox>
          <UploadButton onClick={onOpenUpload}>
            <FaUpload /> Upload Standard
          </UploadButton>
        </ActionGroup>
      </Header>
    );
  },
);

// 2. Table Row Component
const StandardTableRow = React.memo(({ doc, onClick }) => {
  return (
    <tr onClick={() => onClick(doc)}>
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
  );
});

// 3. Table Component
const StandardTable = React.memo(({ docs, onRowClick }) => {
  return (
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
          {docs.map((doc) => (
            <StandardTableRow key={doc.id} doc={doc} onClick={onRowClick} />
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
});

// 4. Detail Modal Component (PDF 생성 ref 포함)
const DetailModal = React.memo(({ doc, onClose, onOpenPdf, onDownload }) => {
  const printRef = useRef(); // ★ 캡처할 영역 참조

  if (!doc) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{doc.title}</h2>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        {/* ★ ref 연결: 이 부분이 이미지로 변환됨 */}
        <ModalBody ref={printRef}>
          <InfoSection>
            <InfoItem>
              <label>Document ID</label>
              <span>{doc.id}</span>
            </InfoItem>
            <InfoItem>
              <label>Current Revision</label>
              <span>{doc.revision}</span>
            </InfoItem>
            <InfoItem>
              <label>Status</label>
              <StatusBadge $status={doc.status}>{doc.status}</StatusBadge>
            </InfoItem>
            <InfoItem>
              <label>Owner</label>
              <span>{doc.owner}</span>
            </InfoItem>
          </InfoSection>

          <DescriptionBox>
            <h4>Description</h4>
            <p style={{ whiteSpace: "pre-line" }}>{doc.description}</p>
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
                {doc.revisions && doc.revisions.length > 0 ? (
                  doc.revisions.map((rev, idx) => (
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
          <PdfBtn onClick={() => onOpenPdf(doc)}>
            <FaEye /> View Content (PDF)
          </PdfBtn>
          {/* 다운로드 버튼 클릭 시 ref 전달 */}
          <DownloadBtn onClick={() => onDownload(doc, printRef)}>
            <FaCloudDownloadAlt /> Download PDF
          </DownloadBtn>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
});

// 5. PDF Viewer Modal
const PdfViewerModal = React.memo(({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <Overlay onClick={onClose} style={{ zIndex: 1100 }}>
      <PdfContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2 style={{ fontSize: 18 }}>
            <FaFilePdf color="#e74c3c" style={{ marginRight: 8 }} />
            {doc.title} ({doc.revision})
          </h2>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>
        <PdfBody>
          <iframe
            src={
              doc.fileUrl ||
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </PdfBody>
      </PdfContent>
    </Overlay>
  );
});

// 6. Upload Modal Component
const StandardUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [form, setForm] = useState({
    title: "",
    category: "Process",
    owner: "",
    revision: "Rev 1.0",
    description: "",
    file: null,
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: "",
        category: "Process",
        owner: "",
        revision: "Rev 1.0",
        description: "",
        file: null,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.owner || !form.file) {
      alert("Please fill in all required fields.");
      return;
    }
    onUpload(form);
  };

  return (
    <Overlay onClick={onClose} style={{ zIndex: 1200 }}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>
            <FaUpload style={{ marginRight: 8 }} /> Upload New Standard
          </h2>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <label>Document Title *</label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex) Etching Process Standard"
            />
          </InputGroup>
          <Row>
            <InputGroup>
              <label>Category</label>
              <Select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Process">Process</option>
                <option value="Equipment">Equipment</option>
                <option value="Quality">Quality</option>
                <option value="Safety">Safety</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <label>Owner *</label>
              <Input
                name="owner"
                value={form.owner}
                onChange={handleChange}
                placeholder="Team or Person"
              />
            </InputGroup>
          </Row>
          <InputGroup>
            <label>Revision</label>
            <Input
              name="revision"
              value={form.revision}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <label>Description</label>
            <TextArea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description..."
            />
          </InputGroup>
          <InputGroup>
            <label>PDF File *</label>
            <FileInput type="file" accept=".pdf" onChange={handleFileChange} />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <DownloadBtn
            onClick={onClose}
            style={{
              background: "#fff",
              color: "#555",
              border: "1px solid #ddd",
            }}
          >
            Cancel
          </DownloadBtn>
          <PdfBtn onClick={handleSubmit}>Upload</PdfBtn>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
};

// --- Main Component ---

const StandardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    setDocuments(MOCK_STANDARDS);
  }, []);

  const handleCategoryChange = useCallback(
    (e) => setCategoryFilter(e.target.value),
    [],
  );
  const handleSearchChange = useCallback(
    (e) => setSearchTerm(e.target.value),
    [],
  );
  const handleRowClick = useCallback((doc) => setSelectedDoc(doc), []);
  const handleCloseDetail = useCallback(() => setSelectedDoc(null), []);
  const handleOpenPdf = useCallback((doc) => setPdfDoc(doc), []);
  const handleClosePdf = useCallback(() => setPdfDoc(null), []);

  // ★ PDF 생성 및 다운로드 로직
  const handleDownload = useCallback(async (doc, printRef) => {
    if (!printRef.current) return;

    try {
      // 1. DOM을 Canvas로 변환
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // 고해상도
        backgroundColor: "#ffffff",
      });

      // 2. Canvas를 이미지로 변환
      const imgData = canvas.toDataURL("image/png");

      // 3. PDF 생성 (A4)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // 4. 이미지 추가 (긴 경우 페이지 나눔)
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // 5. 저장
      pdf.save(`${doc.title}_${doc.revision}.pdf`);
    } catch (err) {
      console.error("PDF Fail:", err);
      alert("PDF 생성에 실패했습니다.");
    }
  }, []);

  // 파일 업로드 로직 (Mock)
  const handleUpload = useCallback((formData) => {
    const newDoc = {
      id: `STD-NEW-${Math.floor(Math.random() * 1000)}`,
      title: formData.title,
      category: formData.category,
      revision: formData.revision,
      status: "DRAFT",
      owner: formData.owner,
      updatedAt: new Date().toISOString().slice(0, 10),
      description: formData.description,
      fileUrl: formData.file ? URL.createObjectURL(formData.file) : null,
      revisions: [
        {
          rev: formData.revision.replace("Rev ", ""),
          date: new Date().toISOString().slice(0, 10),
          author: formData.owner,
          comment: "Initial Upload",
        },
      ],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploadOpen(false);
    alert("Document uploaded successfully!");
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "ALL" || doc.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [documents, searchTerm, categoryFilter]);

  return (
    <Container>
      <StandardHeader
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <StandardTable docs={filteredDocs} onRowClick={handleRowClick} />

      {/* 상세 모달 (PDF 다운로드 기능 포함) */}
      <DetailModal
        doc={selectedDoc}
        onClose={handleCloseDetail}
        onOpenPdf={handleOpenPdf}
        onDownload={handleDownload}
      />

      {/* PDF 뷰어 모달 */}
      <PdfViewerModal doc={pdfDoc} onClose={handleClosePdf} />

      {/* 업로드 모달 */}
      <StandardUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </Container>
  );
};

export default StandardPage;

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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const UploadButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #219150;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa;
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
  backdrop-filter: blur(2px);
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

const PdfContent = styled(ModalContent)`
  width: 90%;
  height: 90%;
  max-width: 1200px;
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
    display: flex;
    align-items: center;
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

const PdfBody = styled.div`
  flex: 1;
  background: #525659;
  padding: 0;
  overflow: hidden;
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
  gap: 10px;
`;

const DownloadBtn = styled.button`
  background: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;

const PdfBtn = styled.button`
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

// --- Upload Modal Styles ---
const InputGroup = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #666;
    font-weight: 600;
  }
`;
const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #1a4f8b;
  }
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #1a4f8b;
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
`;
const FileInput = styled.input`
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
`;
const Row = styled.div`
  display: flex;
  gap: 15px;
  & > div {
    flex: 1;
  }
`;
