// src/pages/admin/AdminMainPage.js
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AdminSideBar from "../../components/layouts/AdminSideBar";
import AdminHeader from "../../components/layouts/AdminHeader";
import { MENU_LIST } from "../../data/menuList";

const AdminMainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabs, setTabs] = useState([{ name: "MES Home", path: "/" }]);

  useEffect(() => {
    const currentMenu = MENU_LIST.find(
      (menu) => menu.path === location.pathname
    );
    if (currentMenu) {
      const exists = tabs.find((tab) => tab.path === currentMenu.path);
      if (!exists) {
        setTabs([...tabs, currentMenu]);
      }
    }
  }, [location.pathname]);

  const removeTab = (pathToRemove) => {
    const newTabs = tabs.filter((tab) => tab.path !== pathToRemove);
    setTabs(newTabs);
    if (location.pathname === pathToRemove) {
      const lastTab = newTabs[newTabs.length - 1];
      navigate(lastTab ? lastTab.path : "/");
    }
  };

  // ★ 추가: 탭 순서 변경 함수 (AdminHeader로 전달할 것임)
  const handleDragEnd = (result) => {
    // 드롭 대상이 없으면 종료
    if (!result.destination) return;

    // 배열 복사 후 순서 변경 로직
    const newTabs = Array.from(tabs);
    const [reorderedItem] = newTabs.splice(result.source.index, 1);
    newTabs.splice(result.destination.index, 0, reorderedItem);

    setTabs(newTabs);
  };

  return (
    <PageContainer>
      <AdminSideBar />
      <MainContent>
        {/* ★ handleDragEnd 전달 */}
        <AdminHeader
          tabs={tabs}
          removeTab={removeTab}
          onDragEnd={handleDragEnd}
        />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminMainPage;

// --- 스타일링 변경 부분 ---

const PageContainer = styled.div`
  display: flex;

  width: 100%; /* vw 대신 % 사용 (스크롤바 생길 때 레이아웃 깨짐 방지) */
  height: 100vh; /* 뷰포트 높이 꽉 채움 */
  background-color: #f4f4f4;

  /* ★ 핵심 변경: 1920x1080 해상도 고정 전략 */
  min-width: 1280px; /* 너비가 1920px보다 작아지면 가로 스크롤 생성 */
  min-height: 800px; /* 높이가 1080px보다 작아지면 세로 스크롤 생성 (선택 사항) */

  max-width: 2560px;
  max-height: 1440px;

  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 부모(PageContainer)의 크기를 따라가도록 설정 */
  min-width: 0;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding-bottom: 20px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
`;
