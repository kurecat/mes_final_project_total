// src/pages/resource/MaterialPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
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
  FaCamera,
} from "react-icons/fa";

import MobileScanner from "../../../components/common/MobileScanner";

/* =============================
   유틸
============================= */
const formatTime = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour12: false });
};

const mapTxToRow = (tx) => {
  const type = tx.type === "INBOUND" ? "IN" : "OUT";
  const target =
    type === "IN"
      ? tx.targetLocation || "-"
      : tx.targetEquipment || tx.targetLocation || "-";

  return {
    id: tx.txId,
    type,
    item: tx.materialName,
    qty: tx.qty,
    unit: tx.unit || "-",
    target,
    time: formatTime(tx.time),
    worker: tx.workerName || "-",
  };
};

/* =============================
   Sub Components
============================= */

const TabHeader = React.memo(({ activeTab, onTabChange }) => (
  <HeaderSection>
    <TabButton
      $active={activeTab === "IN"}
      onClick={() => onTabChange("IN")}
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
      onClick={() => onTabChange("OUT")}
      $color="#e67e22"
    >
      <FaDolly size={24} />
      <div>
        <TabTitle>Line Outbound (불출)</TabTitle>
        <TabDesc>Fab 설비 투입 및 자재 불출 스캔</TabDesc>
      </div>
    </TabButton>
  </HeaderSection>
));

const InputForm = React.memo(
  ({ activeTab, inputs, onChange, onSubmit, onScanClick }) => (
    <InputCard $mode={activeTab}>
      <CardHeader $mode={activeTab}>
        {activeTab === "IN" ? <FaTruckLoading /> : <FaDolly />}
        {activeTab === "IN" ? " 입고 등록 (Scan)" : " 불출 등록 (Scan)"}
      </CardHeader>

      <Form onSubmit={onSubmit}>
        <FormGroup>
          <LabelRow>
            <Label>Material Barcode *</Label>
            <SmallScanBtn type="button" onClick={onScanClick}>
              <FaCamera /> Scan
            </SmallScanBtn>
          </LabelRow>

          <InputWrapper>
            <Input
              name="barcode"
              value={inputs.barcode}
              onChange={onChange}
              placeholder="Scan (ex: WF-001)"
            />
            <ScanIcon>
              <FaBarcode />
            </ScanIcon>
          </InputWrapper>
        </FormGroup>

        <FormGroup>
          <Label>Quantity *</Label>
          <Input
            type="number"
            name="qty"
            value={inputs.qty}
            onChange={onChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {activeTab === "IN"
              ? "Target Location (적재 위치)"
              : "Target Equipment (투입 설비)"}
          </Label>
          <Input name="location" value={inputs.location} onChange={onChange} />
        </FormGroup>

        <SubmitButton type="submit" $mode={activeTab}>
          <FaCheck />
          {activeTab === "IN" ? "CONFIRM INBOUND" : "CONFIRM OUTBOUND"}
        </SubmitButton>
      </Form>
    </InputCard>
  ),
);

const LogTableRow = React.memo(({ row }) => (
  <tr>
    <td>{row.time}</td>
    <td>
      <TypeBadge $type={row.type}>
        {row.type === "IN" ? "입고" : "불출"}
      </TypeBadge>
    </td>
    <td>{row.item}</td>
    <td>{row.qty}</td>
    <td>
      <UnitBadge>{row.unit}</UnitBadge>
    </td>
    <td>{row.target}</td>
    <td>{row.worker}</td>
  </tr>
));

const LogTable = React.memo(
  ({ history, loading, keyword, onKeywordChange }) => (
    <HistorySection>
      <SectionHeader>
        <TitleArea>
          <FaHistory /> Today's Transaction Log
          {loading && <FaSync className="spin" />}
        </TitleArea>

        <SearchGroup>
          <FaSearch />
          <SmallInput value={keyword} onChange={onKeywordChange} />
        </SearchGroup>
      </SectionHeader>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Material</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Target</th>
              <th>Worker</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <LogTableRow key={row.id} row={row} />
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </HistorySection>
  ),
);

/* =============================
   Main Component
============================= */

const MaterialPage = () => {
  const [activeTab, setActiveTab] = useState("IN");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [inputs, setInputs] = useState({ barcode: "", qty: "", location: "" });
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [warehouses, setWarehouses] = useState([]); // 🔥 창고 상태 캐시

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/api/mes/material-tx/transactions/today",
      );
      setHistory((res.data || []).map(mapTxToRow));
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔥 창고 상태 조회 */
  useEffect(() => {
    fetchData(); // 첫 로드 시 실행

    // 3초마다 자동으로 데이터를 새로 가져옴
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval); // 페이지 나갈 때 메모리 해제
  }, [fetchData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        /* 🔥 FULL 창고 프론트 차단 */
        if (activeTab === "IN" && inputs.location) {
          const wh = warehouses.find((w) => w.code === inputs.location);
          if (wh && wh.status === "FULL") {
            alert(
              `❌ FULL 창고입니다\n${wh.code} (${wh.occupancy}/${wh.capacity})`,
            );
            return;
          }
        }

        const qty = Number(inputs.qty);
        if (!inputs.barcode || qty <= 0) {
          alert("입력값 확인");
          return;
        }

        if (activeTab === "IN") {
          await axiosInstance.post("/api/mes/material-tx/inbound", {
            materialBarcode: inputs.barcode,
            qty,
            unit: "ea",
            targetLocation: inputs.location || null,
            workerName: "Admin",
          });
        } else {
          await axiosInstance.post("/api/mes/material-tx/outbound", {
            materialBarcode: inputs.barcode,
            qty,
            unit: "ea",
            targetEquipment: inputs.location || null,
            workerName: "Admin",
          });
        }

        setInputs({ barcode: "", qty: "", location: "" });
        fetchData();
      } catch (err) {
        // ✅ 여기서 재고 부족 메시지 처리
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          "재고 수량이 부족합니다.";

        alert(`❌ ${msg}`);
      }
    },
    [activeTab, inputs, warehouses, fetchData],
  );

  const filteredHistory = useMemo(() => {
    if (!keyword) return history;
    return history.filter((h) =>
      h.item.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [history, keyword]);

  return (
    <Container>
      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <ContentWrapper>
        <InputForm
          activeTab={activeTab}
          inputs={inputs}
          onChange={(e) =>
            setInputs({ ...inputs, [e.target.name]: e.target.value })
          }
          onSubmit={handleSubmit}
          onScanClick={() => setIsScannerOpen(true)}
        />

        <LogTable
          history={filteredHistory}
          loading={loading}
          keyword={keyword}
          onKeywordChange={(e) => setKeyword(e.target.value)}
        />
      </ContentWrapper>

      {isScannerOpen && (
        <MobileScanner
          onScan={(code) => {
            setInputs((p) => ({ ...p, barcode: code }));
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
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

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #555;
`;

// ★ 스캔 버튼 스타일 추가
const SmallScanBtn = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #27ae60;
  }
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
