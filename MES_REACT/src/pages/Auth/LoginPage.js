// src/pages/auth/LoginPage.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight, FaIndustry } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();

  // 입력 상태 관리
  const [inputs, setInputs] = useState({
    id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
    setError(""); // 타이핑 시 에러 초기화
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Mock Login Logic ---
    setTimeout(() => {
      // 테스트용 계정: admin / 1234
      if (inputs.id === "admin" && inputs.password === "1234") {
        // 로그인 성공 시 대시보드로 이동
        navigate("/admin");
      } else {
        setError("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
      }
    }, 800); // 로딩 시뮬레이션
  };

  return (
    <Container>
      <LoginCard>
        {/* 1. 좌측 브랜딩 패널 */}
        <LeftPanel>
          <BrandContent>
            <LogoIcon>
              <FaIndustry />
            </LogoIcon>
            <BrandTitle>Gyun's MES</BrandTitle>
            <BrandDesc>
              Smart Factory Management System
              <br />
              Optimization & Monitoring Solution
            </BrandDesc>
          </BrandContent>
          <Copyright>© 2024 Gyun's Factory. All rights reserved.</Copyright>
          <BackgroundOverlay />
        </LeftPanel>

        {/* 2. 우측 로그인 폼 패널 */}
        <RightPanel>
          <FormContainer onSubmit={handleLogin}>
            <TitleHeader>
              <WelcomeText>Welcome Back!</WelcomeText>
              <SubText>시스템 접속을 위해 로그인해주세요.</SubText>
            </TitleHeader>

            <InputGroup>
              <Label>Employee ID</Label>
              <InputWrapper $error={!!error}>
                <Icon>
                  <FaUser />
                </Icon>
                <Input
                  type="text"
                  name="id"
                  placeholder="아이디를 입력하세요"
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
                  placeholder="비밀번호를 입력하세요"
                  value={inputs.password}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <OptionsRow>
              <CheckboxLabel>
                <input type="checkbox" />
                <span>아이디 저장</span>
              </CheckboxLabel>
              <ForgotLink href="#">비밀번호 찾기</ForgotLink>
            </OptionsRow>

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

export default LoginPage;

// --- Styled Components ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

  @media (max-width: 968px) {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
`;

// Left Panel (Branding)
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

  @media (max-width: 968px) {
    display: none; /* 모바일에서는 숨김 */
  }
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("https://www.transparenttextures.com/patterns/carbon-fibre.png"); /* 패턴 예시 */
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

// Right Panel (Form)
const RightPanel = styled.div`
  flex: 1.2;
  background: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
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
  transition: all 0.2s;
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

  &::placeholder {
    color: #bbb;
  }
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

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 13px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;

  input {
    accent-color: #1a4f8b;
  }
`;

const ForgotLink = styled.a`
  color: #1a4f8b;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
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
  transition: background 0.2s;

  &:hover {
    background-color: #133b6b;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;
