// src/pages/resource/MaterialPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  FaTruckLoading,
  FaDolly,
  FaBarcode,
  FaCheck,
  FaHistory,
  FaArrowRight,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

// --- Mock Data (최근 입출고 이력) ---
const INITIAL_HISTORY = [
  {
    id: 105,
    type: "OUT",
    item: "NCP Underfill Epoxy",
    qty: 5,
    target: "Line-A (Bonding)",
    time: "14:20:05",
    worker: "Kim",
  },
  {
    id: 104,
    type: "IN",
    item: "12-inch Si Wafer",
    qty: 200,
    target: "WH-A-01",
    time: "13:10:22",
    worker: "Lee",
  },
  {
    id: 103,
    type: "OUT",
    item: "HBM Tray (JEDEC)",
    qty: 50,
    target: "Line-B (Pkg)",
    time: "11:45:30",
    worker: "Park",
  },
  {
    id: 102,
    type: "IN",
    item: "Micro Bump (SnAg)",
    qty: 5000,
    target: "WH-A-04",
    time: "10:05:11",
    worker: "Choi",
  },
  {
    id: 101,
    type: "IN",
    item: "Flux Solvent",
    qty: 10,
    target: "WH-C-02",
    time: "09:15:44",
    worker: "Kim",
  },
];

const MaterialPage = () => {
  const [activeTab, setActiveTab] = useState("IN"); // IN (입고), OUT (불출)
  const [history, setHistory] = useState(INITIAL_HISTORY);

  // 입력 폼 상태
  const [inputs, setInputs] = useState({
    barcode: "",
    qty: "",
    location: "",
  });

  // 입력 핸들러
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // 등록(Submit) 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputs.barcode || !inputs.qty) return alert("필수 정보를 입력하세요.");

    const newItem = {
      id: history.length + 106,
      type: activeTab,
      item: inputs.barcode === "RM001" ? "12-inch Wafer" : "Unknown Item", // Mock Logic
      qty: inputs.qty,
      target:
        inputs.location ||
        (activeTab === "IN" ? "Warehouse" : "Production Line"),
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      worker: "Admin",
    };

    setHistory([newItem, ...history]);
    setInputs({ barcode: "", qty: "", location: "" }); // 초기화
    alert(`${activeTab === "IN" ? "입고" : "불출"} 처리가 완료되었습니다.`);
  };

  return (
    <Container>
      {/* 1. 상단 탭 (입고 vs 불출 모드 전환) */}
      <HeaderSection>
        <TabButton
          $active={activeTab === "IN"}
          onClick={() => setActiveTab("IN")}
          $color="#2ecc71" // Green
        >
          <FaTruckLoading size={20} />
          <div>
            <TabTitle>자재 입고 (Inbound)</TabTitle>
            <TabDesc>외부 자재 창고 적재</TabDesc>
          </div>
        </TabButton>

        <TabButton
          $active={activeTab === "OUT"}
          onClick={() => setActiveTab("OUT")}
          $color="#e67e22" // Orange
        >
          <FaDolly size={20} />
          <div>
            <TabTitle>생산 불출 (Outbound)</TabTitle>
            <TabDesc>생산 라인 투입 처리</TabDesc>
          </div>
        </TabButton>
      </HeaderSection>

      <ContentWrapper>
        {/* 2. 좌측: 입력 폼 (스캐너 인터페이스) */}
        <InputCard $mode={activeTab}>
          <CardHeader>
            <FaBarcode />
            {activeTab === "IN" ? " 입고 등록 스캔" : " 불출 등록 스캔"}
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Barcode / Item ID</Label>
              <InputWrapper>
                <Input
                  name="barcode"
                  value={inputs.barcode}
                  onChange={handleChange}
                  placeholder="바코드를 스캔하세요..."
                  autoFocus
                />
                <ScanIcon>
                  <FaBarcode />
                </ScanIcon>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Quantity (수량)</Label>
              <Input
                type="number"
                name="qty"
                value={inputs.qty}
                onChange={handleChange}
                placeholder="수량 입력"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                {activeTab === "IN"
                  ? "Target Location (적재 위치)"
                  : "Target Line (투입 라인)"}
              </Label>
              <Input
                name="location"
                value={inputs.location}
                onChange={handleChange}
                placeholder={activeTab === "IN" ? "예: WH-A-01" : "예: Line-2"}
              />
            </FormGroup>

            <SubmitButton type="submit" $mode={activeTab}>
              <FaCheck />
              {activeTab === "IN"
                ? "입고 확정 (Confirm In)"
                : "불출 확정 (Confirm Out)"}
            </SubmitButton>
          </Form>

          {/* 스캔 가이드 */}
          <ScanGuide>
            * 스캐너가 연결된 경우 바코드를 찍으면 자동으로 입력됩니다.
          </ScanGuide>
        </InputCard>

        {/* 3. 우측: 금일 처리 이력 리스트 */}
        <HistorySection>
          <SectionHeader>
            <TitleArea>
              <FaHistory /> 금일 처리 이력 (Today's Transactions)
            </TitleArea>
            <SearchGroup>
              <FaSearch color="#aaa" />
              <SmallInput placeholder="이력 검색..." />
            </SearchGroup>
          </SectionHeader>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Location/Target</th>
                  <th>Worker</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>{row.time}</td>
                    <td>
                      <TypeBadge $type={row.type}>
                        {row.type === "IN" ? "입고" : "불출"}
                      </TypeBadge>
                    </td>
                    <td style={{ fontWeight: "600" }}>{row.item}</td>
                    <td>{row.qty}</td>
                    <td>{row.target}</td>
                    <td>{row.worker}</td>
                    <td>
                      <SuccessText>Completed</SuccessText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </HistorySection>
      </ContentWrapper>
    </Container>
  );
};

export default MaterialPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

// 1. Header Tabs
const HeaderSection = styled.div`
  display: flex;
  gap: 20px;
  height: 80px;
  flex-shrink: 0;
`;

const TabButton = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 2px solid ${(props) => (props.$active ? props.$color : "transparent")};
  background-color: ${(props) =>
    props.$active ? `${props.$color}10` : "white"};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  svg {
    color: ${(props) => (props.$active ? props.$color : "#aaa")};
  }
`;

const TabTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const TabDesc = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 2px;
`;

// 2. Content Layout
const ContentWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0; /* for nested scrolling */
`;

// Left: Input Card
const InputCard = styled.div`
  width: 400px;
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border-top: 5px solid
    ${(props) => (props.$mode === "IN" ? "#2ecc71" : "#e67e22")};
`;

const CardHeader = styled.h3`
  margin: 0 0 30px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  padding-right: 40px; /* 아이콘 공간 확보 */
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const ScanIcon = styled.div`
  position: absolute;
  right: 15px;
  color: #999;
  font-size: 18px;
`;

const SubmitButton = styled.button`
  margin-top: 20px;
  padding: 15px;
  border: none;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$mode === "IN" ? "#2ecc71" : "#e67e22"};
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ScanGuide = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: #999;
  text-align: center;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
`;

// Right: History Section
const HistorySection = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleArea = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 5px 12px;
  border-radius: 20px;
  gap: 8px;
`;

const SmallInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 150px;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background-color: #fafafa;
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      color: #666;
      border-bottom: 1px solid #eee;
    }
  }

  tbody {
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f5f5f5;
      color: #333;
    }
    tr:hover {
      background-color: #f8fbff;
    }
  }
`;

const TypeBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "IN" ? "#e8f5e9" : "#fff3e0"};
  color: ${(props) => (props.$type === "IN" ? "#2e7d32" : "#e67e22")};
`;

const SuccessText = styled.span`
  color: #2ecc71;
  font-weight: 600;
  font-size: 12px;
`;
