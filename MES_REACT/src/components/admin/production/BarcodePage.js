// src/components/admin/production/BarcodePage.js
import React, { useState, useEffect, useCallback, useRef } from "react"; // useRef 추가
import styled from "styled-components";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print"; // ★ import 추가
import {
  FaBarcode,
  FaBoxOpen,
  FaTimes,
  FaPrint,
  FaCamera,
} from "react-icons/fa";

// MobileScanner 컴포넌트 import
import MobileScanner from "../../common/MobileScanner";

// --- [Sub-Components] ---

// 1. Header Component (기존 유지)
const BarcodeHeader = React.memo(
  ({ onScanClick, manualCode, onManualChange, onManualSubmit }) => {
    return (
      <Header>
        <TitleGroup>
          <FaBarcode size={24} color="#34495e" />
          <h1>Barcode System</h1>
        </TitleGroup>

        <ControlGroup>{/* 필요한 경우 버튼 추가 */}</ControlGroup>
      </Header>
    );
  },
);

// ★ 2. Product Card Component (Print 기능 수정됨)
const ProductItem = React.memo(({ product }) => {
  // 인쇄 영역을 참조하기 위한 ref
  const componentRef = useRef();

  // 인쇄 핸들러
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // 인쇄할 영역 지정
    documentTitle: `Label_${product.name}`, // 파일 저장 시 이름
    onAfterPrint: () => console.log("Printed successfully"),
  });

  return (
    <CardWrapper>
      {/* ★ 인쇄될 영역 (ref 연결) */}
      <div ref={componentRef} style={{ width: "100%", height: "100%" }}>
        <ProductCard>
          <CardHeader>
            <ProductName>{product.name}</ProductName>
            <CategoryBadge>{product.category}</CategoryBadge>
          </CardHeader>
          <BarcodeWrapper>
            <Barcode
              value={product.barcode}
              width={1.5}
              height={50}
              fontSize={14}
            />
          </BarcodeWrapper>
          <CardInfo>
            <span>LOC: {product.location}</span>
            <span>Stock: {product.stock}</span>
          </CardInfo>
        </ProductCard>
      </div>

      {/* 인쇄 버튼 (인쇄 영역 밖으로 뺌) */}
      <CardFooter>
        <PrintBtn onClick={handlePrint}>
          <FaPrint /> Print Label
        </PrintBtn>
      </CardFooter>
    </CardWrapper>
  );
});

// 3. Result Modal Component (기존 유지)
const ScanResultModal = React.memo(({ product, onClose }) => {
  if (!product) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Scan Result</h2>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>
        <ModalBody>
          <ResultIcon>
            <FaBoxOpen size={60} color="#2ecc71" />
          </ResultIcon>
          <ResultTitle>{product.name}</ResultTitle>
          <ResultBarcode>{product.barcode}</ResultBarcode>

          <InfoGrid>
            <InfoItem>
              <label>Category</label>
              <span>{product.category}</span>
            </InfoItem>
            <InfoItem>
              <label>Location</label>
              <span>{product.location}</span>
            </InfoItem>
            <InfoItem>
              <label>Price</label>
              <span>${product.price.toLocaleString()}</span>
            </InfoItem>
            <InfoItem>
              <label>Current Stock</label>
              <StockValue>{product.stock} ea</StockValue>
            </InfoItem>
          </InfoGrid>

          <DescBox>
            <h4>Description</h4>
            <p>{product.description}</p>
          </DescBox>
        </ModalBody>
        <ModalFooter>
          <ActionBtn onClick={onClose}>Close</ActionBtn>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
});

// --- Main Component ---

const BarcodePage = () => {
  // --- State ---
  const [products, setProducts] = useState([]);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inputBuffer, setInputBuffer] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    // MOCK 데이터 (DB 연동 시 axios로 교체)
    const mockProducts = [
      {
        id: 1,
        name: "DDR5 16GB RAM",
        barcode: "8801234567891",
        category: "Memory",
        stock: 150,
        price: 85000,
        location: "A-01",
        description: "High performance memory",
      },
      {
        id: 2,
        name: "NAND Flash 1TB",
        barcode: "8801234567892",
        category: "Storage",
        stock: 50,
        price: 120000,
        location: "B-05",
        description: "SSD Storage controller",
      },
      {
        id: 3,
        name: "SUBSTRATE",
        barcode: "MAT-SUBSTRATE",
        category: "RAW_MATERIAL",
        stock: 50,
        price: 120000,
        location: "WH-ALL-001",
        description: "SSD Storage controller",
      },
      {
        id: 4,
        name: "SOLDERBALL",
        barcode: "MAT-SOLDERBALL",
        category: "RAW_MATERIAL",
        stock: 50,
        price: 120000,
        location: "WH-ALL-001",
        description: "SSD Storage controller",
      },
      {
        id: 5,
        name: "UNDERFILL",
        barcode: "MAT-UNDERFILL",
        category: "RAW_MATERIAL",
        stock: 50,
        price: 120000,
        location: "WH-ALL-001",
        description: "SSD Storage controller",
      },
    ];
    setProducts(mockProducts);
  }, []);

  // --- Handlers (useCallback) ---

  const handleScan = useCallback(
    (code) => {
      console.log("Scanned Code:", code);
      setLastScannedCode(code);

      const found = products.find(
        (p) => p.barcode.toLowerCase() === code.toLowerCase(),
      );

      if (found) {
        setScannedProduct(found);
      } else {
        alert(`Product not found for barcode: ${code}`);
      }
    },
    [products],
  );

  const handleManualSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (lastScannedCode) {
        handleScan(lastScannedCode);
      }
    },
    [lastScannedCode, handleScan],
  );

  const handleManualChange = useCallback((e) => {
    setLastScannedCode(e.target.value);
  }, []);

  const handleCameraScan = useCallback(
    (decodedText) => {
      handleScan(decodedText);
      setIsScannerOpen(false);
    },
    [handleScan],
  );

  const handleCloseScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setScannedProduct(null);
  }, []);

  const handleOpenScanner = useCallback(() => {
    setIsScannerOpen(true);
  }, []);

  // --- Barcode Scanner Logic ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scannedProduct || isScannerOpen) return;

      if (e.key === "Enter") {
        if (inputBuffer.length > 0) {
          handleScan(inputBuffer);
          setInputBuffer("");
        }
      } else {
        if (e.key.length === 1) {
          setInputBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputBuffer, scannedProduct, isScannerOpen, handleScan]);

  return (
    <Container>
      <BarcodeHeader
        onScanClick={handleOpenScanner}
        manualCode={lastScannedCode}
        onManualChange={handleManualChange}
        onManualSubmit={handleManualSubmit}
      />

      <Content>
        <ProductGrid>
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </ProductGrid>
      </Content>

      <ScanResultModal product={scannedProduct} onClose={handleCloseModal} />

      {isScannerOpen && (
        <MobileScanner onScan={handleCameraScan} onClose={handleCloseScanner} />
      )}
    </Container>
  );
};

export default BarcodePage;

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

const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

// ★ 카드 래퍼 (인쇄 버튼 분리를 위해 추가)
const CardWrapper = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ProductCard = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;

  /* ★ 인쇄 시 스타일 강제 설정 */
  @media print {
    border: 1px solid #000;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  min-height: 40px;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 15px;
  line-height: 1.4;
  flex: 1;
`;

const CategoryBadge = styled.span`
  background: #eef2f7;
  color: #555;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  margin-left: 10px;
  height: fit-content;
`;

const BarcodeWrapper = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`;

const CardInfo = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-top: 10px;
`;

// ★ Footer 스타일 (버튼 영역)
const CardFooter = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px 15px 20px;
  background: #fcfcfc;
  border-top: 1px solid #eee;
`;

const PrintBtn = styled.button`
  background: white;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    background: #3498db;
    color: white;
  }
`;

// --- Modal Styles ---
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
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

const ModalContent = styled.div`
  background: white;
  width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s;
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fcfcfc;
  h2 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResultIcon = styled.div`
  margin-bottom: 15px;
`;

const ResultTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: #333;
  text-align: center;
`;

const ResultBarcode = styled.div`
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-family: monospace;
  color: #555;
  margin: 10px 0 25px 0;
  font-size: 14px;
`;

const InfoGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  label {
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
  }
  span {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
`;

const StockValue = styled.span`
  color: #2ecc71 !important;
  font-weight: bold !important;
`;

const DescBox = styled.div`
  width: 100%;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  text-align: left;
  h4 {
    margin: 0 0 5px 0;
    font-size: 13px;
    color: #666;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
  }
`;

const ModalFooter = styled.div`
  padding: 15px;
  background: #fcfcfc;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
`;

const ActionBtn = styled.button`
  background: #34495e;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #2c3e50;
  }
`;
