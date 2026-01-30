import React, { useState, useRef } from "react";
import Barcode from "react-barcode";

const BarcodeGenerator = () => {
  // 사용자가 입력한 데이터 상태
  const [inputText, setInputText] = useState("");

  // 바코드 옵션 상태 (필요하면 추가/수정 가능)
  const [options, setOptions] = useState({
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
  });

  // 입력 핸들러
  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  // 인쇄 핸들러
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Barcode Generator</h1>

      {/* 1. 데이터 입력 영역 */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          placeholder="바코드로 변환할 내용을 입력하세요"
          autoFocus
          style={{
            padding: "10px",
            fontSize: "18px",
            width: "300px",
            border: "2px solid #333",
            borderRadius: "5px",
          }}
        />
      </div>

      {/* 2. 바코드 출력 영역 */}
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          display: "inline-block",
          minWidth: "300px",
          minHeight: "150px",
          backgroundColor: "#fff",
        }}
      >
        {inputText ? (
          <Barcode
            value={inputText}
            format={options.format}
            width={options.width}
            height={options.height}
            displayValue={options.displayValue}
          />
        ) : (
          <p style={{ color: "#aaa", marginTop: "50px" }}>
            데이터를 입력하면 여기에 바코드가 나타납니다.
          </p>
        )}
      </div>

      {/* 3. 버튼 영역 */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => setInputText("")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          초기화
        </button>
        <button
          onClick={handlePrint}
          disabled={!inputText}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          인쇄하기 (브라우저 인쇄)
        </button>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
