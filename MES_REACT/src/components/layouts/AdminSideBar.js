// src/components/admin/AdminSideBar.js
import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const AdminSideBar = () => {
  const location = useLocation();

  return (
    <Container>
      <LogoArea>Gyun's MES</LogoArea>
      <Menu>
        {/* 1. 홈 (대시보드) */}
        <MenuItem
          to="/"
          $active={
            location.pathname === "/" || location.pathname === "/dashboard"
          }
        >
          MES Home
        </MenuItem>

        {/* 2. 자재 관리 (App.js의 path="products"와 일치시킴) */}
        <MenuItem to="/products" $active={location.pathname === "/products"}>
          자재 관리
        </MenuItem>

        {/* 3. 생산 관리 (App.js의 path="orders"와 일치시킴) */}
        <MenuItem to="/orders" $active={location.pathname === "/orders"}>
          생산 관리
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminSideBar;

// ... (스타일 코드는 기존과 동일하게 유지)
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
// ... 나머지 스타일 동일
const LogoArea = styled.div`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 40px;
  padding-left: 10px;
  letter-spacing: 1px;
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
  font-size: 14px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 30px;
  text-align: center;
  transition: all 0.2s;

  background-color: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#1a4f8b" : "white")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;
