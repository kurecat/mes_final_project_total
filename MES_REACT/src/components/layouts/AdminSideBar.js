import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

// 아이콘 임포트 (필요한 아이콘 추가)
import {
  FaBoxOpen,
  FaIndustry,
  FaClipboardList,
  FaCogs,
  FaChartPie,
  FaChevronDown,
  FaChevronUp,
  FaDatabase,
} from "react-icons/fa";

const AdminSideBar = () => {
  const location = useLocation();

  // 현재 열려있는 대메뉴의 ID를 관리 (null이면 모두 닫힘)
  const [openMenuId, setOpenMenuId] = useState(null);

  // 메뉴 구조 정의
  const MENU_LIST = [
    {
      id: "dashboard",
      title: "모니터링/대시보드",
      icon: <FaChartPie />,
      subMenus: [
        { title: "종합 상황판", path: "/admin/dashboard" }, // /admin 추가
        { title: "KPI 분석", path: "/admin/dashboard/kpi" }, // /admin 추가
      ],
    },
    {
      id: "production",
      title: "생산 관리",
      icon: <FaIndustry />,
      subMenus: [
        { title: "생산 계획", path: "/admin/production/plan" },
        { title: "작업 지시", path: "/admin/production/workorder" },
        { title: "생산 실적 현황", path: "/admin/production/performance" },
        { title: "작업자 배치", path: "/admin/production/worker" },
        { title: "바코드", path: "/admin/production/barcode" },
      ],
    },
    {
      id: "quality",
      title: "품질 관리",
      icon: <FaClipboardList />,
      subMenus: [
        { title: "검사 기준 설정", path: "/admin/quality/standard" },
        { title: "불량 관리", path: "/admin/quality/defect" },
        { title: "Lot 추적", path: "/admin/quality/tracking" },
        { title: "SPC 차트", path: "/admin/quality/spcchart" },
      ],
    },
    {
      id: "material",
      title: "설비/자재 관리",
      icon: <FaBoxOpen />,
      subMenus: [
        { title: "설비 가동 현황", path: "/admin/resource/machine" },
        { title: "자재 입/출고", path: "/admin/resource/material" },
        { title: "재고 현황", path: "/admin/resource/inventory" },
      ],
    },
    {
      id: "mdm",
      title: "기준 정보 관리",
      icon: <FaDatabase />,
      subMenus: [
        { title: "품목 관리", path: "/admin/mdm/item" },
        { title: "BOM 관리", path: "/admin/mdm/bom" },
        { title: "공정/라우팅", path: "/admin/mdm/routing" },
        { title: "설비 관리", path: "/admin/mdm/equipment" },
        { title: "창고/작업장", path: "/admin/mdm/location" },
      ],
    },
    {
      id: "system",
      title: "시스템 관리",
      icon: <FaCogs />,
      subMenus: [
        { title: "사용자 관리", path: "/admin/system/users" },
        { title: "권한/그룹 관리", path: "/admin/system/roles" },
        { title: "공통 코드", path: "/admin/system/codes" },
        { title: "로그 관리", path: "/admin/system/logs" },
      ],
    },
  ];
  // 메뉴 토글 함수
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // URL이 변경될 때 해당 메뉴를 자동으로 열기 위한 Effect
  useEffect(() => {
    const currentPath = location.pathname;
    const foundMenu = MENU_LIST.find((menu) =>
      menu.subMenus.some((sub) => sub.path === currentPath)
    );
    if (foundMenu) {
      setOpenMenuId(foundMenu.id);
    }
  }, [location.pathname]);

  return (
    <Container>
      <LogoArea>Gyun's MES</LogoArea>
      <Menu>
        {MENU_LIST.map((menu) => {
          const isOpen = openMenuId === menu.id;
          // 현재 URL이 하위 메뉴 중 하나와 일치하는지 확인 (대메뉴 활성화 스타일용)
          const isActiveGroup = menu.subMenus.some(
            (sub) => sub.path === location.pathname
          );

          return (
            <MenuGroup key={menu.id}>
              {/* 대메뉴 (클릭 시 토글) */}
              <ParentMenuItem
                onClick={() => toggleMenu(menu.id)}
                $active={isActiveGroup || isOpen}
              >
                <LeftSection>
                  <IconWrapper>{menu.icon}</IconWrapper>
                  {menu.title}
                </LeftSection>
                <ArrowIcon $isOpen={isOpen}>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </ArrowIcon>
              </ParentMenuItem>

              {/* 하위 메뉴 (드롭다운) */}
              <SubMenuContainer $isOpen={isOpen}>
                {menu.subMenus.map((sub) => (
                  <SubMenuItem
                    key={sub.title}
                    to={sub.path}
                    $active={location.pathname === sub.path}
                  >
                    - {sub.title}
                  </SubMenuItem>
                ))}
              </SubMenuContainer>
            </MenuGroup>
          );
        })}
      </Menu>
    </Container>
  );
};

export default AdminSideBar;

// --- Styled Components ---

const Container = styled.div`
  width: 280px; /* 너비 살짝 줄임 (일반적인 사이드바 크기) */
  min-width: 280px;
  height: 100vh;
  background-color: #1a4f8b;
  display: flex;
  flex-direction: column;
  padding: 30px 15px;
  box-sizing: border-box;
  color: white;
  overflow-y: auto; /* 메뉴가 많아지면 스크롤 */

  /* 스크롤바 숨기기 (선택사항) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const LogoArea = styled.div`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 30px;
  text-align: center;
  color: #fff;
  letter-spacing: 1px;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MenuGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

// 대메뉴 스타일 (Link가 아니라 div 혹은 button 역할)
const ParentMenuItem = styled.div`
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 15px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: space-between; /* 화살표를 우측 끝으로 */

  transition: all 0.2s;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.15)" : "transparent"};
  color: ${(props) => (props.$active ? "#fff" : "#e0e0e0")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    color: white;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  width: 24px; /* 아이콘 너비 고정하여 텍스트 정렬 맞춤 */
  justify-content: center;
`;

const ArrowIcon = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  opacity: 0.7;
`;

// 하위 메뉴 컨테이너 (애니메이션 효과 가능)
const SubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: ${(props) =>
    props.$isOpen ? "500px" : "0"}; /* 열리고 닫히는 효과 */
  transition: max-height 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.15); /* 하위 메뉴 배경을 약간 어둡게 */
  border-radius: 0 0 10px 10px;
  margin-top: ${(props) => (props.$isOpen ? "5px" : "0")};
`;

// 하위 메뉴 아이템
const SubMenuItem = styled(Link)`
  text-decoration: none;
  font-size: 14px;
  padding: 10px 15px 10px 50px; /* 아이콘만큼 들여쓰기 */
  color: ${(props) =>
    props.$active ? "#ffd700" : "#d1d5db"}; /* 활성 시 노란색 포인트 */
  font-weight: ${(props) => (props.$active ? "700" : "400")};
  transition: all 0.2s;

  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;
