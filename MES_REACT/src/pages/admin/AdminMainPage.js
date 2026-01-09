// src/pages/admin/AdminMainPage.js
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AdminSideBar from "../../components/layouts/AdminSideBar";
import AdminHeader from "../../components/layouts/AdminHeader";
import { MENU_LIST } from "../../data/menuList"; // 1단계의 데이터

const AdminMainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. 탭 목록 상태 (기본값: Home)
  const [tabs, setTabs] = useState([{ name: "MES Home", path: "/" }]);

  // 2. URL이 바뀔 때마다 탭 목록에 추가하는 감지 로직
  useEffect(() => {
    // 현재 경로에 해당하는 메뉴 찾기
    const currentMenu = MENU_LIST.find(
      (menu) => menu.path === location.pathname
    );

    if (currentMenu) {
      // 이미 탭에 있는지 확인
      const exists = tabs.find((tab) => tab.path === currentMenu.path);
      if (!exists) {
        setTabs([...tabs, currentMenu]); // 없으면 추가
      }
    }
  }, [location.pathname]); // 경로가 바뀔 때마다 실행

  // 3. 탭 닫기 함수
  const removeTab = (pathToRemove) => {
    // 닫으려는 탭 제외하고 남기기
    const newTabs = tabs.filter((tab) => tab.path !== pathToRemove);
    setTabs(newTabs);

    // 만약 현재 보고 있는 탭을 닫았다면, 마지막 탭으로 이동
    if (location.pathname === pathToRemove) {
      const lastTab = newTabs[newTabs.length - 1];
      navigate(lastTab ? lastTab.path : "/");
    }
  };

  return (
    <PageContainer>
      <AdminSideBar />
      <MainContent>
        {/* Header에 탭 목록(tabs)과 삭제 함수(removeTab) 전달 */}
        <AdminHeader tabs={tabs} removeTab={removeTab} />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminMainPage;

const PageContainer = styled.div`
  display: flex;
  width: 1920px;
  height: 1080px;
  background-color: #f4f4f4;
  overflow: hidden;
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
`;
