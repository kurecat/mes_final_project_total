import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Barcode from "react-barcode";
import {
  FaBarcode,
  FaBoxOpen,
  FaSearch,
  FaTimes,
  FaPrint,
  FaCamera, // 카메라 아이콘 추가
} from "react-icons/fa";

// ★ MobileScanner 컴포넌트 import (경로 확인 필요)
import MobileScanner from "../../common/MobileScanner";

const BarcodePage = () => {
  // --- State ---
  const [products, setProducts] = useState([]);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inputBuffer, setInputBuffer] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");

  // ★ 카메라 스캐너 상태 추가
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    // MOCK 데이터 사용 (테스트용)
    // 실제 서버가 있다면 fetch 로직 유지
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
    ];
    setProducts(mockProducts);

    // fetch("http://localhost:3001/products")
    //   .then((res) => res.json())
    //   .then((data) => setProducts(data))
    //   .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // --- Barcode Scanner Logic (Global Listener) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 모달이나 스캐너가 열려있으면 키보드 리스너 중단
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
  }, [inputBuffer, products, scannedProduct, isScannerOpen]);

  // --- Handlers ---
  const handleScan = (code) => {
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
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleScan(lastScannedCode);
    setLastScannedCode(""); // 검색 후 입력창 초기화 선택사항
  };

  // ★ 카메라 스캔 성공 핸들러
  const handleCameraScan = (decodedText) => {
    handleScan(decodedText);
    setIsScannerOpen(false); // 스캔 성공 시 카메라 닫기
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaBarcode size={24} color="#34495e" />
          <h1>Barcode System</h1>
        </TitleGroup>

        <ControlGroup>
          {/* ★ 카메라 버튼 추가 */}
          <ScanBtn type="button" onClick={() => setIsScannerOpen(true)}>
            <FaCamera /> Mobile Scan
          </ScanBtn>

          {/* 수동 테스트 입력창 */}
          <TestBox onSubmit={handleManualSubmit}>
            <input
              placeholder="Click here & Scan or Type..."
              value={lastScannedCode}
              onChange={(e) => setLastScannedCode(e.target.value)}
              // autoFocus // 모바일에서 키패드 자동 올라옴 방지 위해 주석 처리 가능
            />
            <button type="submit">Check</button>
          </TestBox>
        </ControlGroup>
      </Header>

      <Content>
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id}>
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
              <CardFooter>
                <span>Stock: {product.stock}</span>
                <PrintBtn
                  onClick={() => alert(`Print label for ${product.name}`)}
                >
                  <FaPrint /> Print
                </PrintBtn>
              </CardFooter>
            </ProductCard>
          ))}
        </ProductGrid>
      </Content>

      {/* --- Scan Result Modal --- */}
      {scannedProduct && (
        <Overlay onClick={() => setScannedProduct(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Scan Result</h2>
              <CloseBtn onClick={() => setScannedProduct(null)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <ResultIcon>
                <FaBoxOpen size={60} color="#2ecc71" />
              </ResultIcon>
              <ResultTitle>{scannedProduct.name}</ResultTitle>
              <ResultBarcode>{scannedProduct.barcode}</ResultBarcode>

              <InfoGrid>
                <InfoItem>
                  <label>Category</label>
                  <span>{scannedProduct.category}</span>
                </InfoItem>
                <InfoItem>
                  <label>Location</label>
                  <span>{scannedProduct.location}</span>
                </InfoItem>
                <InfoItem>
                  <label>Price</label>
                  <span>${scannedProduct.price.toLocaleString()}</span>
                </InfoItem>
                <InfoItem>
                  <label>Current Stock</label>
                  <StockValue>{scannedProduct.stock} ea</StockValue>
                </InfoItem>
              </InfoGrid>

              <DescBox>
                <h4>Description</h4>
                <p>{scannedProduct.description}</p>
              </DescBox>
            </ModalBody>
            <ModalFooter>
              <ActionBtn onClick={() => setScannedProduct(null)}>
                Close
              </ActionBtn>
            </ModalFooter>
          </ModalContent>
        </Overlay>
      )}

      {/* ★ 카메라 스캐너 모달 (조건부 렌더링) */}
      {isScannerOpen && (
        <MobileScanner
          onScan={handleCameraScan}
          onClose={() => setIsScannerOpen(false)}
        />
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

// ★ 스캔 버튼 스타일 추가
const ScanBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  height: 40px; /* 인풋창과 높이 맞춤 */

  &:hover {
    background-color: #27ae60;
  }
`;

const TestBox = styled.form`
  display: flex;
  gap: 10px;
  input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 200px;
    outline: none;
    height: 40px; /* 버튼과 높이 맞춤 */
    box-sizing: border-box;
    &:focus {
      border-color: #3498db;
    }
  }
  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 0 15px;
    border-radius: 4px;
    cursor: pointer;
    height: 40px;
    &:hover {
      background: #2980b9;
    }
  }
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

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 15px;
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  background: #eef2f7;
  color: #555;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  margin-left: 10px;
`;

const BarcodeWrapper = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: center;
`;

const CardFooter = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 13px;
  color: #666;
`;

const PrintBtn = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  &:hover {
    background: #f5f5f5;
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
