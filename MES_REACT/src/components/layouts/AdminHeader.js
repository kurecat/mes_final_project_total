import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoMdClose,
  IoIosHome,
  IoMdSunny,
  IoMdCloudy,
  IoMdRainy,
  IoMdSnow,
} from "react-icons/io"; // ★ IoIosHome 추가
import { FaSignOutAlt, FaClock } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

const AdminHeader = ({ tabs, removeTab, onDragEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Home 탭과 나머지 탭 분리
  const homeTab = tabs.find((tab) => tab.path === "/");
  const otherTabs = tabs.filter((tab) => tab.path !== "/");

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // DnD 라이브러리는 otherTabs(0, 1, 2...) 기준으로 인덱스를 줍니다.
    // 하지만 부모의 tabs state는 [Home, A, B...] 형태이므로 인덱스를 1씩 더해서 부모에게 전달합니다.
    const adjustedResult = {
      ...result,
      source: {
        ...result.source,
        index: result.source.index + 1,
      },
      destination: {
        ...result.destination,
        index: result.destination.index + 1,
      },
    };

    onDragEnd(adjustedResult);
  };

  return (
    <Container>
      <Menubar>
        <Breadcrumb>MES Home</Breadcrumb>
        <RightSection>
          <span>Admin</span>
        </RightSection>
      </Menubar>

      <Toolbar>
        {/* ★ 3. Home 탭: 드래그 영역 밖에서 단독 렌더링 (절대 고정) */}
        {homeTab && (
          <TabItem
            $active={location.pathname === "/"}
            $isHome={true}
            onClick={() => navigate("/")}
          >
            <FaHome size={18} />
          </TabItem>
        )}

        {/* ★ 4. 나머지 탭들만 DragDropContext로 감쌈 */}
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
                        $isHome={false}
                        $isDragging={snapshot.isDragging}
                        onClick={() => navigate(tab.path)}
                        style={{ ...provided.draggableProps.style }}
                      >
                        {tab.name}
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
      </Toolbar>
    </Container>
  );
};

export default AdminHeader;

// --- 스타일링 ---

// --- Styled Components (기존 코드 유지) ---
const Container = styled.div`
  height: 100px;
  background-color: #cdd2d9;
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
  background-color: #2c3e50;
  color: white;
`;

const Breadcrumb = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ecf0f1;
  letter-spacing: 0.5px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
`;

const ClockItem = styled.div`
  display: flex;
  align-items: center;
  font-family: monospace;
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
  color: ${(props) => (props.$logout ? "#e74c3c" : "#ecf0f1")};
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

const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  background-color: #e9ecef;
  display: flex;
  align-items: flex-end;
  padding-left: 10px;
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
  font-size: 13px;
  margin-bottom: -1px;
  margin-left: -1px;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$active ? "#ffffff" : "#e2e6ea")};
  }
`;

const HomeTabItem = styled(BaseTabItem)`
  min-width: 40px;
  padding: 0 15px;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
  font-weight: 700;
  border-right: 1px solid #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabItem = styled(BaseTabItem)`
  max-width: 180px;
  min-width: 120px;
  padding: 0 8px 0 15px;
  justify-content: space-between;

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
  font-size: 14px;
  color: #999;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #e74c3c;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const WeatherItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  color: #ecf0f1;

  svg {
    font-size: 18px;
  }

  .desc {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    margin-left: 2px;
    @media (max-width: 800px) {
      display: none;
    }
  }
`;
