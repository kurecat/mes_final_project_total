// src/pages/resource/MaterialPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  FaTruckLoading,
  FaDolly,
  FaBarcode,
  FaCheck,
  FaHistory,
  FaSearch,
  FaFlask,
  FaCircle,
  FaMicrochip,
  FaSync,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_HISTORY = [
  {
    id: 105,
    type: "OUT",
    item: "Photo Resist (ArF)",
    qty: 5,
    unit: "Btl",
    target: "Photo-Line-A",
    time: "14:20:05",
    worker: "Kim",
  },
  {
    id: 104,
    type: "IN",
    item: "12-inch Prime Wafer",
    qty: 25,
    unit: "Box",
    target: "WH-Raw-01",
    time: "13:10:22",
    worker: "Lee",
  },
  {
    id: 103,
    type: "OUT",
    item: "Etching Gas (C4F6)",
    qty: 2,
    unit: "Cyl",
    target: "Etch-Line-B",
    time: "11:45:30",
    worker: "Park",
  },
  {
    id: 102,
    type: "IN",
    item: "Copper Target (Cu)",
    qty: 10,
    unit: "ea",
    target: "WH-Part-04",
    time: "10:05:11",
    worker: "Choi",
  },
  {
    id: 101,
    type: "IN",
    item: "Slurry (Ceria)",
    qty: 20,
    unit: "Drum",
    target: "WH-Chem-02",
    time: "09:15:44",
    worker: "Kim",
  },
];

const MaterialPage = () => {
  const [activeTab, setActiveTab] = useState("IN"); // IN (입고) or OUT (불출)
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [loading, setLoading] = useState(true);

  // 입력 폼 상태
  const [inputs, setInputs] = useState({
    barcode: "",
    qty: "",
    location: "",
  });

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    try {
      // ★ 실제 API: http://localhost:3001/materialHistory?_sort=id&_order=desc
      // const res = await axios.get("http://localhost:3001/materialHistory?_sort=id&_order=desc");
      // setHistory(res.data);

      setTimeout(() => {
        setHistory(MOCK_HISTORY);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 입력 핸들러
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // 등록 핸들러 (API POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputs.barcode || !inputs.qty) return alert("필수 정보를 입력하세요.");

    // 바코드에 따른 자재명 자동 매핑 (예시)
    let itemName = "Unknown Item";
    if (inputs.barcode.includes("WF")) itemName = "12-inch Prime Wafer";
    else if (inputs.barcode.includes("PR")) itemName = "Photo Resist (ArF)";
    else if (inputs.barcode.includes("GAS")) itemName = "Etching Gas (C4F6)";
    else if (inputs.barcode.includes("TGT")) itemName = "Copper Target";

    const newItem = {
      // id: Date.now(), // json-server가 자동 생성하므로 생략 가능
      type: activeTab,
      item: itemName,
      qty: Number(inputs.qty),
      unit: itemName.includes("Wafer") ? "Box" : "ea",
      target:
        inputs.location || (activeTab === "IN" ? "Warehouse" : "Fab Line"),
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      worker: "Admin", // 현재 로그인 유저
    };

    try {
      // ★ 실제 API POST
      // await axios.post("http://localhost:3001/materialHistory", newItem);
      // fetchData(); // 목록 갱신

      // Mock 동작
      setHistory([{ ...newItem, id: Date.now() }, ...history]);

      setInputs({ barcode: "", qty: "", location: "" });
      alert(`${activeTab === "IN" ? "입고" : "불출"} 처리가 완료되었습니다.`);
    } catch (err) {
      console.error("Transcaton Error", err);
    }
  };

  return (
    <Container>
      {/* 1. 상단 탭 (입고 vs 불출) */}
      <HeaderSection>
        <TabButton
          $active={activeTab === "IN"}
          onClick={() => setActiveTab("IN")}
          $color="#2ecc71"
        >
          <FaTruckLoading size={24} />
          <div>
            <TabTitle>Material Inbound (입고)</TabTitle>
            <TabDesc>Raw Wafer / Chemical / Parts 입고 검수</TabDesc>
          </div>
        </TabButton>
        <TabButton
          $active={activeTab === "OUT"}
          onClick={() => setActiveTab("OUT")}
          $color="#e67e22"
        >
          <FaDolly size={24} />
          <div>
            <TabTitle>Line Outbound (불출)</TabTitle>
            <TabDesc>Fab 설비 투입 및 자재 불출 스캔</TabDesc>
          </div>
        </TabButton>
      </HeaderSection>

      <ContentWrapper>
        {/* 2. 좌측: 스캔 및 입력 폼 */}
        <InputCard $mode={activeTab}>
          <CardHeader $mode={activeTab}>
            {activeTab === "IN" ? <FaTruckLoading /> : <FaDolly />}
            {activeTab === "IN" ? " 입고 등록 (Scan)" : " 불출 등록 (Scan)"}
          </CardHeader>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Material Barcode *</Label>
              <InputWrapper>
                <Input
                  name="barcode"
                  value={inputs.barcode}
                  onChange={handleChange}
                  placeholder="Scan (ex: WF-001, PR-A)"
                  autoFocus
                />
                <ScanIcon>
                  <FaBarcode />
                </ScanIcon>
              </InputWrapper>
              <HintText>Tip: 'WF', 'PR', 'GAS' 등을 포함해보세요.</HintText>
            </FormGroup>

            <FormGroup>
              <Label>Quantity *</Label>
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
                  : "Target Equipment (투입 설비)"}
              </Label>
              <Input
                name="location"
                value={inputs.location}
                onChange={handleChange}
                placeholder={
                  activeTab === "IN" ? "ex: WH-Raw-01" : "ex: Photo-02"
                }
              />
            </FormGroup>

            <SubmitButton type="submit" $mode={activeTab}>
              <FaCheck />{" "}
              {activeTab === "IN" ? "CONFIRM INBOUND" : "CONFIRM OUTBOUND"}
            </SubmitButton>
          </Form>
        </InputCard>

        {/* 3. 우측: 수불 이력 테이블 */}
        <HistorySection>
          <SectionHeader>
            <TitleArea>
              <FaHistory /> Today's Transaction Log
              {loading && (
                <FaSync
                  className="spin"
                  style={{ fontSize: 12, marginLeft: 8, color: "#999" }}
                />
              )}
            </TitleArea>
            <SearchGroup>
              <FaSearch color="#aaa" />
              <SmallInput placeholder="Search Item..." />
            </SearchGroup>
          </SectionHeader>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Material Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Target Loc/Eq</th>
                  <th>Worker</th>
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
                    <td
                      style={{
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {row.item.includes("Wafer") ? (
                        <FaCircle size={8} color="#555" />
                      ) : row.item.includes("Gas") ? (
                        <FaFlask size={10} color="#3498db" />
                      ) : (
                        <FaMicrochip size={12} color="#f39c12" />
                      )}
                      {row.item}
                    </td>
                    <td style={{ fontWeight: "bold" }}>{row.qty}</td>
                    <td>
                      <UnitBadge>{row.unit}</UnitBadge>
                    </td>
                    <td>{row.target}</td>
                    <td>{row.worker}</td>
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

const HeaderSection = styled.div`
  display: flex;
  gap: 20px;
  height: 90px;
  flex-shrink: 0;
`;
const TabButton = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid ${(props) => (props.$active ? props.$color : "transparent")};
  background-color: ${(props) =>
    props.$active ? `${props.$color}10` : "white"};
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  svg {
    color: ${(props) => (props.$active ? props.$color : "#ccc")};
  }
`;
const TabTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #333;
`;
const TabDesc = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
`;

const InputCard = styled.div`
  width: 380px;
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border-top: 5px solid
    ${(props) => (props.$mode === "IN" ? "#2ecc71" : "#e67e22")};
`;

const CardHeader = styled.h3`
  margin: 0 0 25px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: ${(props) => (props.$mode === "IN" ? "#27ae60" : "#d35400")};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
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
  padding-right: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
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
  font-size: 16px;
`;
const HintText = styled.span`
  font-size: 11px;
  color: #999;
  margin-left: 2px;
`;

const SubmitButton = styled.button`
  margin-top: 15px;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background-color: ${(props) =>
    props.$mode === "IN" ? "#2ecc71" : "#e67e22"};
  color: white;
  font-size: 15px;
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

const HistorySection = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 6px 12px;
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
const UnitBadge = styled.span`
  font-size: 11px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
`;
