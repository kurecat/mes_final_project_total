// src/components/admin/AdminHeader.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaHome, FaSignOutAlt, FaUserCircle, FaClock } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const AdminHeader = ({ tabs, removeTab, onDragEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  const homeTab = tabs.find((tab) => tab.path === "/");
  const otherTabs = tabs.filter((tab) => tab.path !== "/");

  // --- 실시간 시계 로직 ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 드래그 앤 드롭 핸들러 ---
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const adjustedResult = {
      ...result,
      source: { ...result.source, index: result.source.index + 1 },
      destination: {
        ...result.destination,
        index: result.destination.index + 1,
      },
    };
    onDragEnd(adjustedResult);
  };

  // --- 로그아웃 핸들러 ---
  const handleLogout = () => {
    // 여기에 실제 로그아웃 로직 (토큰 삭제 등) 추가 가능
    // alert("Logged out successfully.");
    navigate("/"); // 로그인 페이지 경로에 맞게 수정하세요
  };

  return (
    <Container>
      {/* 1. 상단 메뉴바 (브레드크럼 + 우측 정보) */}
      <Menubar>
        <Breadcrumb>MES System Management</Breadcrumb>

        <RightSection>
          {/* 시계 */}
          <ClockItem>
            <FaClock size={14} style={{ marginRight: 6 }} />
            {currentTime.toLocaleTimeString()}
          </ClockItem>

          {/* 구분선 */}
          <Divider />

          {/* 마이페이지 */}
          <HeaderBtn onClick={() => navigate("/mypage")} title="My Page">
            <FaUserCircle size={18} />
            <span>My Page</span>
          </HeaderBtn>

          {/* 로그아웃 */}
          <HeaderBtn onClick={handleLogout} title="Logout" $logout>
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </HeaderBtn>
        </RightSection>
      </Menubar>

      {/* 2. 탭 툴바 (드래그 가능한 탭 목록) */}
      <Toolbar>
        {/* Home 탭 (고정) */}
        {homeTab && (
          <HomeTabItem
            $active={location.pathname === "/"}
            onClick={() => navigate("/")}
          >
            <FaHome size={18} />
          </HomeTabItem>
        )}

        {/* 나머지 탭들 (스크롤 가능 영역) */}
        <ScrollContainer>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tabs" direction="horizontal">
              {(provided) => (
                <DraggableArea
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {otherTabs.map((tab, index) => (
                    <Draggable
                      key={tab.path}
                      draggableId={tab.path}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TabItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          $active={location.pathname === tab.path}
                          $isDragging={snapshot.isDragging}
                          onClick={() => navigate(tab.path)}
                          style={{ ...provided.draggableProps.style }}
                          title={tab.name}
                        >
                          <TabText>{tab.name}</TabText>
                          <CloseBtn
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTab(tab.path);
                            }}
                          >
                            <IconWrapper>
                              <IoMdClose />
                            </IconWrapper>
                          </CloseBtn>
                        </TabItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </DraggableArea>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollContainer>
      </Toolbar>
    </Container>
  );
};

export default AdminHeader;

// --- 스타일링 ---

const Container = styled.div`
  height: 100px;
  background-color: #cdd2d9; /* 헤더 배경색 */
  display: flex;
  flex-direction: column;
`;

const Menubar = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  background-color: #2c3e50; /* 상단 메뉴바 어두운 배경 */
  color: white;
`;

const Breadcrumb = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ecf0f1;
  letter-spacing: 0.5px;
`;

// 우측 영역 (시계, 버튼들)
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
`;

const ClockItem = styled.div`
  display: flex;
  align-items: center;
  font-family: monospace; /* 숫자가 튀지 않게 고정폭 폰트 */
  font-size: 15px;
  color: #bdc3c7;
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 10px;
  border-radius: 4px;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: #7f8c8d;
  margin: 0 5px;
`;

const HeaderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: ${(props) =>
    props.$logout ? "#e74c3c" : "#ecf0f1"}; /* 로그아웃은 빨간색 강조 */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

// --- 탭 툴바 영역 (기존 스타일 유지 및 보완) ---
const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  background-color: #e9ecef;
  display: flex;
  align-items: flex-end;
  padding-left: 20px;
  border-bottom: 1px solid #ccc;
  overflow: hidden;
`;

const ScrollContainer = styled.div`
  flex: 1;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: flex-end;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #bbb;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const DraggableArea = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;
  margin-left: -1px;
  min-width: max-content;
`;

const BaseTabItem = styled.div`
  height: 39px;
  background-color: ${(props) =>
    props.$isDragging ? "#e2e6ea" : props.$active ? "#ffffff" : "#f8f9fa"};
  color: ${(props) => (props.$active ? "#000" : "#666")};
  font-weight: ${(props) => (props.$active ? "600" : "normal")};
  border: 1px solid #ccc;
  border-bottom: ${(props) =>
    props.$active ? "1px solid white" : "1px solid #ccc"};
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: -1px;
  margin-left: -1px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#ffffff" : "#e2e6ea")};
  }
`;

const HomeTabItem = styled(BaseTabItem)`
  min-width: 50px;
  padding: 0 10px;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 10;
`;

const TabItem = styled(BaseTabItem)`
  max-width: 180px;
  min-width: 120px;
  padding: 0 10px 0 15px;
  justify-content: space-between;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const TabText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 5px;
`;

const CloseBtn = styled.span`
  flex-shrink: 0;
  font-size: 16px;
  color: #999;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: #333;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
`;
