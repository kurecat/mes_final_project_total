import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const AdminSideBar = () => {
  const location = useLocation();

  return (
    <Container>
      <LogoArea>Gyun's MES</LogoArea>
      <Menu>
        {/* 현재 경로와 일치하면 active 스타일 적용 */}
        <MenuItem to="/" $active={location.pathname === "/"}>
          MES Home
        </MenuItem>
        <MenuItem to="/material" $active={location.pathname === "/material"}>
          자재 관리
        </MenuItem>
        <MenuItem
          to="/production"
          $active={location.pathname === "/production"}
        >
          생산 관리
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminSideBar;

const Container = styled.div`
  width: 300px; /* 1920 해상도에서는 사이드바가 좀 더 넓은 게 균형이 맞음 */
  height: 100%; /* 부모(1080px)를 꽉 채움 */
  background-color: #1a4f8b;
  display: flex;
  flex-direction: column;
  padding: 30px 20px; /* 상하 여백을 좀 더 줌 */
  box-sizing: border-box;
  color: white;
`;

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
  gap: 15px; /* 메뉴 사이 간격 */
`;

// active prop에 따라 스타일 변경
const MenuItem = styled(Link)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 30px; /* 둥근 버튼 스타일 */
  text-align: center;
  transition: all 0.2s;

  /* 활성화 상태(현재 페이지)이거나 hover일 때 흰색 배경 */
  background-color: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#1a4f8b" : "white")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;
