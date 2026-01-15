// src/components/admin/AdminSideBar.js
import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

// 집모양 ,
import { FaHome, FaBoxOpen, FaIndustry } from "react-icons/fa";
import { AiOutlineAreaChart } from "react-icons/ai";

const AdminSideBar = () => {
  const location = useLocation();

  return (
    <Container>
      <LogoArea>Gyun's MES</LogoArea>
      <Menu>
        {/* 1. 홈 (대시보드) */}
        <MenuItem to="/" $active={location.pathname === "/"}>
          <IconWrapper>
            <FaHome />
          </IconWrapper>
          MES Home
        </MenuItem>

        {/* 2. 자재 관리 (App.js의 path="products"와 일치시킴) */}
        <MenuItem to="/material" $active={location.pathname === "/material"}>
          <IconWrapper>
            <FaBoxOpen />
          </IconWrapper>
          자재 관리
        </MenuItem>

        {/* 3. 생산 관리 (App.js의 path="orders"와 일치시킴) */}
        <MenuItem to="/workorder" $active={location.pathname === "/workorder"}>
          <IconWrapper>
            <FaIndustry />
          </IconWrapper>
          생산 관리
        </MenuItem>

        <MenuItem to="/dashboard" $active={location.pathname === "/dashboard"}>
          <IconWrapper>
            <AiOutlineAreaChart />
          </IconWrapper>
          대시보드
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminSideBar;

const Container = styled.div`
  width: 300px;
  height: 100%;
  background-color: #1a4f8b;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  box-sizing: border-box;
  color: white;
`;

const LogoArea = styled.div`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 40px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MenuItem = styled(Link)`
  text-decoration: none;
  font-size: 16px; /* 글자 크기 약간 키움 */
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 30px;

  /* Flex로 아이콘과 텍스트 가로 정렬 */
  display: flex;
  align-items: center;
  gap: 12px; /* 아이콘과 글자 사이 간격 */

  transition: all 0.2s;
  background-color: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#1a4f8b" : "white")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

// 아이콘 크기 조절 등을 위한 래퍼 (선택 사항)
const IconWrapper = styled.div`
  font-size: 18px; /* 아이콘 크기 */
  display: flex;
  align-items: center;
`;
