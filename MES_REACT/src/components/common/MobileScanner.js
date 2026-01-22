import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";

const MobileScanner = ({ onScan, onClose }) => {
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    // ★ PC 웹캠 설정 변경 부분 ★
    // 모바일 후면 카메라: { facingMode: "environment" }
    // PC 웹캠 / 모바일 전면: { facingMode: "user" }
    const cameraConfig = { facingMode: "user" };

    html5QrCode
      .start(
        cameraConfig,
        config,
        (decodedText, decodedResult) => {
          // 스캔 성공 시
          console.log("Scan Success:", decodedText);
          onScan(decodedText);

          html5QrCode
            .stop()
            .then(() => {
              onClose();
            })
            .catch((err) => console.error(err));
        },
        (errorMessage) => {
          // 스캔 중 에러 (무시)
        },
      )
      .catch((err) => {
        console.error("Camera start failed:", err);
        setErrorMsg(
          "웹캠을 찾을 수 없습니다. 연결 상태와 브라우저 권한을 확인해주세요.",
        );
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.error("Stop failed", err));
      }
    };
  }, [onScan, onClose]);

  return (
    <Overlay>
      <ScannerContainer>
        <Header>
          <h3>Webcam Barcode Scanner</h3>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        {/* 카메라 영역 */}
        <div
          id="reader"
          style={{ width: "100%", height: "100%", background: "black" }}
        ></div>

        {errorMsg && <ErrorText>{errorMsg}</ErrorText>}

        <Description>
          웹캠에 바코드를 가까이 대주세요.
          <br />
          (초점이 잘 맞아야 인식됩니다)
        </Description>
      </ScannerContainer>
    </Overlay>
  );
};

export default MobileScanner;

// --- Styled Components (동일함) ---
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ScannerContainer = styled.div`
  background: white;
  width: 500px; /* PC 모니터에선 좀 더 넓게 */
  max-width: 90%;
  border-radius: 12px;
  overflow: hidden;
  padding-bottom: 20px;
  position: relative;

  #reader {
    width: 100%;
    min-height: 350px;
  }

  #reader video {
    object-fit: cover;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #1a4f8b;
  color: white;

  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
`;

const Description = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 15px;
  line-height: 1.5;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  background: #fadbd8;
  padding: 10px;
  text-align: center;
  font-size: 13px;
  margin: 10px;
  border-radius: 4px;
`;
