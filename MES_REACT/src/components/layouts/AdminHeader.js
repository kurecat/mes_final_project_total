// src/components/admin/AdminHeader.js
import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";

// 부모에게서 tabs와 removeTab을 props로 받음
const AdminHeader = ({ tabs, removeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container>
      <Menubar>
        <Breadcrumb>MES Home</Breadcrumb>
        <RightSection>
          <span>Admin</span>
        </RightSection>
      </Menubar>

      <Toolbar>
        {tabs.map((tab) => (
          <TabItem
            key={tab.path}
            // 현재 경로와 같으면 active 스타일 적용
            $active={location.pathname === tab.path}
            onClick={() => navigate(tab.path)} // 탭 클릭 시 이동
          >
            {tab.name}
            {/* 홈("/")이 아닐 때만 닫기 버튼 표시 */}
            {tab.path !== "/" && (
              <CloseBtn
                onClick={(e) => {
                  e.stopPropagation(); // 부모 클릭 이벤트 방지
                  removeTab(tab.path);
                }}
              >
                ×
              </CloseBtn>
            )}
          </TabItem>
        ))}
      </Toolbar>
    </Container>
  );
};

export default AdminHeader;

// --- 스타일링 ---

const Container = styled.div`
  height: 100px;
  background-color: #cdd2d9;
  display: flex;
  flex-direction: column; /* 세로 배치로 변경 */
`;

const Menubar = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-sizing: border-box;
`;

const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  background-color: #e9ecef; /* 탭이 없는 배경 부분 색상 (연한 회색) */
  display: flex;
  align-items: flex-end;
  padding-left: 20px;
  gap: 2px; /* 탭 사이 간격 */
  border-bottom: 1px solid #ccc; /* 하단에 전체 선 하나 긋기 */
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const RightSection = styled.div`
  font-size: 14px;
  color: #333;
`;

// 개별 탭 디자인
const TabItem = styled.div`
  min-width: 150px; /* 이미지처럼 조금 넓게 */
  height: 39px; /* 하단 선(1px)과 높이 맞춤 */
  padding: 0 20px;

  /* 활성화 상태면 흰색, 아니면 옅은 배경색 */
  background-color: ${(props) => (props.$active ? "#ffffff" : "#f8f9fa")};
  color: ${(props) => (props.$active ? "#000" : "#666")};
  font-weight: ${(props) => (props.$active ? "600" : "normal")};

  /* border-radius 제거하고 사각형 테두리 적용 */
  border: 1px solid #ccc;
  border-bottom: ${(props) =>
    props.$active
      ? "1px solid white"
      : "1px solid #ccc"}; /* 활성 탭만 하단 테두리 없앰 */

  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: -1px; /* 활성 탭 하단 선 덮기용 */

  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#ffffff" : "#e2e6ea")};
  }
`;

const CloseBtn = styled.span`
  margin-left: 10px;
  font-size: 16px;
  color: #999;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
