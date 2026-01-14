// src/components/admin/AdminHeader.js
import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const AdminHeader = ({ tabs, removeTab, onDragEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const homeTab = tabs.find((tab) => tab.path === "/");
  const otherTabs = tabs.filter((tab) => tab.path !== "/");

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

  return (
    <Container>
      <Menubar>
        <Breadcrumb>MES Home</Breadcrumb>
        <RightSection>
          <span>Admin</span>
        </RightSection>
      </Menubar>

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
                          title={tab.name} /* 마우스 올리면 전체 이름 표시 */
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

// --- 스타일링 수정 ---

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
  padding: 0 30px;
  box-sizing: border-box;
`;

const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  background-color: #e9ecef;
  display: flex;
  align-items: flex-end;
  padding-left: 20px;
  border-bottom: 1px solid #ccc;
  overflow: hidden; /* 자식 요소가 넘치지 않도록 */
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

// ★ 스크롤 컨테이너 추가
const ScrollContainer = styled.div`
  flex: 1; /* 남은 공간 모두 차지 */
  height: 100%;
  overflow-x: auto; /* 내용 넘치면 가로 스크롤 생성 */
  overflow-y: hidden;
  display: flex;
  align-items: flex-end;

  /* 스크롤바 커스텀 (선택 사항) */
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
  min-width: max-content; /* 자식 탭들의 너비만큼 확보 */
`;

// 공통 탭 스타일
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

// Home 탭 (고정 너비)
const HomeTabItem = styled(BaseTabItem)`
  min-width: 50px;
  padding: 0 10px;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0; /* 스크롤 시에도 줄어들지 않음 */
  z-index: 10; /* 스크롤바 위로 올라오지 않게 하거나 필요시 조정 */
`;

// 일반 탭 (가변 너비 + 말줄임표)
const TabItem = styled(BaseTabItem)`
  max-width: 180px; /* ★ 최대 너비 설정 */
  min-width: 120px; /* ★ 최소 너비 설정 */
  padding: 0 10px 0 15px;
  justify-content: space-between;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

// ★ 텍스트 말줄임표 처리용 컴포넌트
const TabText = styled.span`
  flex: 1; /* 남은 공간 차지 */
  white-space: nowrap; /* 줄바꿈 금지 */
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* ... 처리 */
  margin-right: 5px;
`;

const CloseBtn = styled.span`
  /* flex-shrink: 0; 닫기 버튼은 줄어들지 않게 고정 */
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
