// src/pages/production/BarcodePage.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Barcode from "react-barcode"; // 바코드 생성 라이브러리
import {
  FaBarcode,
  FaBoxOpen,
  FaSearch,
  FaTimes,
  FaPrint,
} from "react-icons/fa";

const BarcodePage = () => {
  // --- State ---
  const [products, setProducts] = useState([]);
  const [scannedProduct, setScannedProduct] = useState(null); // 모달에 띄울 제품
  const [inputBuffer, setInputBuffer] = useState(""); // 스캔 입력 버퍼
  const [lastScannedCode, setLastScannedCode] = useState(""); // 마지막 스캔 기록

  // --- Data Fetching ---
  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // --- Barcode Scanner Logic (Global Listener) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 모달이 열려있다면 스캔 로직 중단 (옵션)
      // if (scannedProduct) return;

      if (e.key === "Enter") {
        // 엔터키가 입력되면 버퍼에 있는 바코드로 제품 검색
        if (inputBuffer.length > 0) {
          handleScan(inputBuffer);
          setInputBuffer(""); // 버퍼 초기화
        }
      } else {
        // 일반 문자는 버퍼에 쌓음 (스캐너가 빠르게 입력함)
        // Shift, Control 등 특수키 제외하고 문자/숫자만 처리
        if (e.key.length === 1) {
          setInputBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputBuffer, products]); // products 의존성 추가하여 최신 데이터 참조

  // --- Handlers ---
  const handleScan = (code) => {
    console.log("Scanned Code:", code);
    setLastScannedCode(code);

    const found = products.find(
      (p) => p.barcode.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setScannedProduct(found);
      // 성공 효과음 재생 (선택 사항)
      // new Audio('/beep.mp3').play();
    } else {
      alert(`Product not found for barcode: ${code}`);
    }
  };

  // 수동 테스트용 핸들러
  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleScan(lastScannedCode);
    setLastScannedCode("");
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaBarcode size={24} color="#34495e" />
          <h1>Barcode System</h1>
        </TitleGroup>

        {/* 수동 테스트 입력창 (스캐너 없을 때 테스트용) */}
        <TestBox onSubmit={handleManualSubmit}>
          <input
            placeholder="Click here & Scan or Type..."
            value={lastScannedCode}
            onChange={(e) => setLastScannedCode(e.target.value)}
            autoFocus
          />
          <button type="submit">Check</button>
        </TestBox>
      </Header>

      <Content>
        {/* 제품 리스트 (바코드 라벨 출력용) */}
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

const TestBox = styled.form`
  display: flex;
  gap: 10px;
  input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 250px;
    outline: none;
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
