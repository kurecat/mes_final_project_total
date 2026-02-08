// src/pages/Auth/LoginPage.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight, FaIndustry } from "react-icons/fa";
import axiosInstance from "../../api/axios";

const LoginPage = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. [안전장치] 이미 로딩 중이라면 클릭 무시
    if (isLoading) return;

    // 2. [유효성 검사]
    if (!inputs.id || !inputs.password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🚀 로그인 요청 시작...");
      const response = await axiosInstance.post("/auth/login", {
        email: inputs.id, // 백엔드가 username을 원하면 username으로 변경 필요
        password: inputs.password,
        name: inputs.name,
      });

      const resultData = response.data.data; // TokenDto

      console.log("✅ 로그인 응답 데이터:", response.data);

      // [수정 1] 토큰 구조가 data.data 안에 있는지, 바로 data 안에 있는지 유연하게 체크
      const accessToken =
        response.data.data?.accessToken || response.data.accessToken;
      const refreshToken =
        response.data.data?.refreshToken || response.data.refreshToken;

      const userName =
        resultData.memberInfo?.name ||
        resultData.name ||
        inputs.id.split("@")[0] ||
        "User";
      const authority =
        resultData.memberInfo?.authority || resultData.authority || "ROLE_USER";

      console.log("사용자 이름:", userName);
      console.log("사용자 권한:", authority);

      if (accessToken) {
        // 1. 로컬 스토리지 저장
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", authority);

        // [수정 2] ★ 중요: 다음 요청(대시보드)을 위해 즉시 헤더에 토큰 설정
        // 이걸 안 하면 페이지 이동 직후 첫 요청에서 401이 뜰 수 있음
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        // 3. 페이지 이동 (경로 확인: /admin이 맞는지, /dashboard가 맞는지)
        // 만약 대시보드 경로가 /dashboard라면 아래 주석을 풀고 변경하세요.
        window.location.href = "/admin";
      } else {
        setError("서버 응답에 토큰이 없습니다.");
        console.error("토큰 없음:", response.data);
      }
    } catch (err) {
      console.error("❌ 로그인 에러 발생:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError("아이디 또는 비밀번호가 일치하지 않습니다.");
        } else if (err.response.status === 400) {
          setError("입력 정보를 다시 확인해주세요.");
        } else if (err.response.status >= 500) {
          setError("서버 오류가 발생했습니다. 관리자에게 문의하세요.");
        } else {
          setError(`로그인 실패 (${err.response.status})`);
        }
      } else if (err.request) {
        setError("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
      } else {
        setError("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      console.log("🏁 로딩 상태 해제");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <LeftPanel>
          <BrandContent>
            <LogoIcon>
              <FaIndustry />
            </LogoIcon>
            <BrandTitle>Gyun's MES</BrandTitle>
            <BrandDesc>
              Smart Factory System
              <br />
              Optimization & Monitoring
            </BrandDesc>
          </BrandContent>
          <Copyright>© 2026 Gyun's Factory</Copyright>
          <BackgroundOverlay />
        </LeftPanel>

        <RightPanel>
          <FormContainer onSubmit={handleLogin}>
            <TitleHeader>
              <WelcomeText>Welcome!</WelcomeText>
              <SubText>시스템 로그인을 진행해주세요.</SubText>
            </TitleHeader>

            <InputGroup>
              <Label>Email</Label>
              <InputWrapper $error={!!error}>
                <Icon>
                  <FaUser />
                </Icon>
                <Input
                  type="text"
                  name="id"
                  placeholder="admin@mes.com"
                  value={inputs.id}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <InputWrapper $error={!!error}>
                <Icon>
                  <FaLock />
                </Icon>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={inputs.password}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
              {!isLoading && <FaArrowRight />}
            </LoginButton>
          </FormContainer>
        </RightPanel>
      </LoginCard>
    </Container>
  );
};

// --- 스타일 컴포넌트 (기존과 동일) ---
const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;
const LoginCard = styled.div`
  display: flex;
  width: 900px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
`;
const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #1a4f8b 0%, #2980b9 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
  text-align: center;
`;
const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
  opacity: 0.1;
  pointer-events: none;
`;
const BrandContent = styled.div`
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const LogoIcon = styled.div`
  font-size: 50px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
`;
const BrandTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 15px 0;
  letter-spacing: 1px;
`;
const BrandDesc = styled.p`
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.8;
  font-weight: 300;
`;
const Copyright = styled.div`
  position: absolute;
  bottom: 30px;
  font-size: 12px;
  opacity: 0.5;
`;
const RightPanel = styled.div`
  flex: 1.2;
  background: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const FormContainer = styled.form`
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
`;
const TitleHeader = styled.div`
  margin-bottom: 40px;
`;
const WelcomeText = styled.h2`
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
`;
const SubText = styled.p`
  color: #888;
  font-size: 14px;
  margin: 0;
`;
const InputGroup = styled.div`
  margin-bottom: 20px;
`;
const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
`;
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => (props.$error ? "#e74c3c" : "#ddd")};
  border-radius: 8px;
  padding: 0 15px;
  height: 48px;
  background-color: #f9f9f9;
  &:focus-within {
    border-color: #1a4f8b;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(26, 79, 139, 0.1);
  }
`;
const Icon = styled.div`
  color: #aaa;
  margin-right: 12px;
  font-size: 14px;
`;
const Input = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  height: 100%;
  font-size: 14px;
  outline: none;
  color: #333;
`;
const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 15px;
  margin-top: -10px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
`;
const LoginButton = styled.button`
  width: 100%;
  height: 50px;
  background-color: #1a4f8b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  &:hover {
    background-color: #133b6b;
  }
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

export default LoginPage;
