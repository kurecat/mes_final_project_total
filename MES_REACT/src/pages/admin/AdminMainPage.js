// src/pages/admin/AdminMainPage.js
import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom"; // 핵심: 자식 컴포넌트가 들어올 구멍

// 만들어두신 컴포넌트 import (경로 확인해주세요)
import AdminSideBar from "../../components/layouts/AdminSideBar";
import AdminHeader from "../../components/layouts/AdminHeader";

const AdminMainPage = () => {
  return (
    <Container>
      {/* 1. 왼쪽 고정 사이드바 */}
      <AdminSideBar />

      {/* 2. 우측 영역 (헤더 + 콘텐츠) */}
      <MainWrapper>
        <AdminHeader />

        <ContentArea>
          {/* 여기가 핵심입니다! URL에 따라 Dashboard, ProductManage 등이 여기에 렌더링됩니다. */}
          <Outlet />
        </ContentArea>
      </MainWrapper>
    </Container>
  );
};

export default AdminMainPage;

// --- 스타일 (지난번 레이아웃 코드 활용) ---
const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f4f4f4;
`;

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 스크롤은 ContentArea 내부에서만 생기도록 */
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* 내용이 길어지면 여기서 스크롤 */
  box-sizing: border-box;
`;
