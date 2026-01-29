// src/pages/admin/AdminMainPage.js
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IoIosHome } from "react-icons/io"; // 홈 아이콘 Import
import AdminSideBar from "../../components/layouts/AdminSideBar";
import AdminHeader from "../../components/layouts/AdminHeader";
import { MENU_LIST } from "../../data/menuList";

const AdminMainPage = () => {
  console.log("📢 AdminMainPage가 렌더링 되었습니다!");

  const location = useLocation();
  const navigate = useNavigate();

  // ★ 탭 상태 초기화
  // 1. name: 텍스트 없이 아이콘만 렌더링 (IconWrapper로 중앙 정렬)
  // 2. 아이콘 크기: size={22}로 설정하여 적절한 크기로 조절
  // 3. closable: false 설정으로 'X' 버튼 표시 방지 (AdminHeader에서 처리 필요)
  const [tabs, setTabs] = useState([
    {
      name: (
        <IconWrapper>
          <IoIosHome size={22} />
        </IconWrapper>
      ),
      path: "/admin/dashboard",
      closable: false,
    },
  ]);

  // URL 변경 시 탭 자동 추가
  useEffect(() => {
    const currentMenu = MENU_LIST.find(
      (menu) => menu.path === location.pathname,
    );
    if (currentMenu) {
      const exists = tabs.find((tab) => tab.path === currentMenu.path);
      if (!exists) {
        setTabs([...tabs, currentMenu]);
      }
    }
  }, [location.pathname]);

  // 탭 닫기 로직
  const removeTab = (pathToRemove) => {
    // ★ 홈("/") 탭은 삭제 방지 (혹시 X 버튼이 눌려도 동작하지 않음)
    if (pathToRemove === "/admin/dashboard") return;

    const newTabs = tabs.filter((tab) => tab.path !== pathToRemove);
    setTabs(newTabs);

    // 현재 보고 있던 탭을 닫은 경우, 마지막 탭으로 이동
    if (location.pathname === pathToRemove) {
      const lastTab = newTabs[newTabs.length - 1];
      navigate(lastTab ? lastTab.path : "/admin/dashboard");
    }
  };

  // 탭 순서 변경 (드래그 앤 드롭)
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newTabs = Array.from(tabs);
    const [reorderedItem] = newTabs.splice(result.source.index, 1);
    newTabs.splice(result.destination.index, 0, reorderedItem);

    setTabs(newTabs);
  };

  return (
    <PageContainer>
      <AdminSideBar />
      <MainContent>
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

// --- 스타일 컴포넌트 ---

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f4f4f4;

  /* 해상도 대응 (최소 1280px / 최대 QHD) */
  min-width: 1280px;
  min-height: 800px;
  max-width: 2560px;
  max-height: 1440px;

  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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

// 아이콘을 수직/수평 중앙 정렬하기 위한 래퍼 컴포넌트 추가 및 스타일링
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 4px; /* 아이콘 주변에 약간의 여백을 주어 균형을 맞춤 */
`;
