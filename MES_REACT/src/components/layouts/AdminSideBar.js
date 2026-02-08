import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

// 아이콘 임포트
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

// 북마크 아이콘 (Ci)
import { CiBookmark, CiBookmarkCheck } from "react-icons/ci";

const AdminSideBar = () => {
  const location = useLocation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [role, setRole] = useState("ROLE_OPERATOR");

  useEffect(() => {
    // 로컬 스토리지에서 권한 가져오기
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setRole(storedRole);
  }, []);

  // 북마크 상태 관리
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem("sidebar_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // ★ [수정 1] MENU_LIST를 useMemo로 감싸서 리렌더링 시에도 유지되게 함
  const MENU_LIST = useMemo(
    () => [
      {
        id: "dashboard",
        title: "대시보드",
        icon: <FaChartPie />,
        allowedRoles: ["ROLE_ADMIN", "ROLE_PRODUCTION_ADMIN"],
        subMenus: [{ title: "종합 상황판", path: "/admin/dashboard" }],
      },
      {
        id: "production",
        title: "생산 관리",
        icon: <FaIndustry />,
        allowedRoles: ["ROLE_ADMIN", "ROLE_PRODUCTION_ADMIN"],
        subMenus: [
          { title: "생산 계획", path: "/admin/production/plan" },
          { title: "작업 지시", path: "/admin/production/workorder" },
          { title: "생산 실적 현황", path: "/admin/production/performance" },
          { title: "생산 로그", path: "/admin/production/productionlogs" },
          { title: "작업자 배치", path: "/admin/production/worker" },
          { title: "바코드", path: "/admin/production/barcode" },
        ],
      },
      {
        id: "quality",
        title: "품질 관리",
        icon: <FaClipboardList />,
        allowedRoles: ["ROLE_ADMIN", "ROLE_PRODUCTION_ADMIN"],
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
        allowedRoles: ["ROLE_ADMIN", "ROLE_PRODUCTION_ADMIN"],
        subMenus: [
          { title: "설비 가동 현황", path: "/admin/resource/machine" },
          { title: "자재 입/출고", path: "/admin/resource/material" },
          { title: "재고 현황", path: "/admin/resource/inventory" },
          { title: "설비 로그", path: "/admin/resource/equipmentlog" },
        ],
      },
      {
        id: "mdm",
        title: "기준 정보 관리",
        icon: <FaDatabase />,
        allowedRoles: ["ROLE_ADMIN"],
        subMenus: [
          { title: "자재 관리", path: "/admin/mdm/material" },
          { title: "제품 관리", path: "/admin/mdm/product" },
          { title: "BOM 관리", path: "/admin/mdm/bom" },
          { title: "설비 관리", path: "/admin/mdm/equipment" },
          { title: "창고/작업장", path: "/admin/mdm/location" },
        ],
      },
      {
        id: "system",
        title: "시스템 관리",
        icon: <FaCogs />,
        allowedRoles: ["ROLE_ADMIN"],
        subMenus: [
          { title: "사용자 관리", path: "/admin/system/users" },
          { title: "권한/그룹 관리", path: "/admin/system/roles" },
          { title: "공통 코드", path: "/admin/system/codes" },
          { title: "로그 관리", path: "/admin/system/logs" },
        ],
      },
    ],
    [],
  );

  // ★ [수정 2] 필터링 및 정렬 로직을 useMemo로 감싸서 의존성 값이 변할 때만 재계산
  const sortedMenuList = useMemo(() => {
    // 1. 권한 필터링
    const filtered = MENU_LIST.filter((menu) =>
      menu.allowedRoles.includes(role),
    );

    // 2. 북마크 정렬
    return [...filtered].sort((a, b) => {
      const aBookmarked = bookmarkedIds.includes(a.id);
      const bBookmarked = bookmarkedIds.includes(b.id);
      if (aBookmarked && !bBookmarked) return -1;
      if (!aBookmarked && bBookmarked) return 1;
      return 0;
    });
  }, [MENU_LIST, role, bookmarkedIds]); // role이나 bookmark가 바뀔 때만 재계산

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    let newBookmarks;
    if (bookmarkedIds.includes(id)) {
      newBookmarks = bookmarkedIds.filter((bid) => bid !== id);
    } else {
      newBookmarks = [...bookmarkedIds, id];
    }
    setBookmarkedIds(newBookmarks);
    localStorage.setItem("sidebar_bookmarks", JSON.stringify(newBookmarks));
  };

  // URL 변경 시 해당 메뉴 펼치기
  useEffect(() => {
    const currentPath = location.pathname;
    const foundMenu = sortedMenuList.find((menu) =>
      menu.subMenus.some((sub) => sub.path === currentPath),
    );
    if (foundMenu) {
      setOpenMenuId(foundMenu.id);
    }
    // sortedMenuList가 useMemo로 고정되었으므로, 이제 메뉴를 클릭해도 이 Effect가 불필요하게 돌지 않습니다.
  }, [location.pathname, sortedMenuList]);

  return (
    <Container>
      <LogoArea>StackUp MES</LogoArea>
      <Menu>
        {sortedMenuList.map((menu) => {
          const isOpen = openMenuId === menu.id;
          const isActiveGroup = menu.subMenus.some(
            (sub) => sub.path === location.pathname,
          );
          const isBookmarked = bookmarkedIds.includes(menu.id);

          return (
            <MenuGroup key={menu.id}>
              <ParentMenuItem
                onClick={() => toggleMenu(menu.id)}
                $active={isActiveGroup || isOpen}
              >
                <LeftSection>
                  <BookmarkIcon
                    onClick={(e) => toggleBookmark(e, menu.id)}
                    $active={isBookmarked}
                  >
                    {isBookmarked ? (
                      <CiBookmarkCheck
                        size={22}
                        color="#ffd700"
                        strokeWidth={1}
                      />
                    ) : (
                      <CiBookmark
                        size={22}
                        className="empty-mark"
                        strokeWidth={1}
                      />
                    )}
                  </BookmarkIcon>
                  <IconWrapper>{menu.icon}</IconWrapper>
                  <TitleText>{menu.title}</TitleText>
                </LeftSection>
                <ArrowIcon $isOpen={isOpen}>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </ArrowIcon>
              </ParentMenuItem>

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

// --- Styled Components --- (기존과 동일)

const Container = styled.div`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  background-color: #1a4f8b;
  display: flex;
  flex-direction: column;
  padding: 30px 15px;
  box-sizing: border-box;
  color: white;
  overflow-y: auto;

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

const ParentMenuItem = styled.div`
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 10px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  transition: all 0.2s;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.15)" : "transparent"};
  color: ${(props) => (props.$active ? "#fff" : "#e0e0e0")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    color: white;

    .empty-mark {
      opacity: 1;
    }
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const IconWrapper = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  width: 24px;
  justify-content: center;
`;

const TitleText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BookmarkIcon = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  cursor: pointer;
  width: 24px;
  min-width: 24px;

  .empty-mark {
    opacity: 0.3;
    transition: opacity 0.2s;
    color: #e0e0e0;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const ArrowIcon = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  margin-left: 10px;
`;

const SubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: ${(props) => (props.$isOpen ? "500px" : "0")};
  transition: max-height 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 0 0 10px 10px;
  margin-top: ${(props) => (props.$isOpen ? "5px" : "0")};
`;

const SubMenuItem = styled(Link)`
  text-decoration: none;
  font-size: 14px;
  padding: 10px 15px 10px 60px;
  color: ${(props) => (props.$active ? "#ffd700" : "#d1d5db")};
  font-weight: ${(props) => (props.$active ? "700" : "400")};
  transition: all 0.2s;

  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;
