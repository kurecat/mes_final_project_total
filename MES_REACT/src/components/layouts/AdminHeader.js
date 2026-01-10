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

  // 1. Home 탭과 나머지 탭 분리
  const homeTab = tabs.find((tab) => tab.path === "/");
  const otherTabs = tabs.filter((tab) => tab.path !== "/");

  // 2. 드래그 종료 시 인덱스 보정 (Home 탭이 0번이므로 +1 해줌)
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
  /* gap을 없애고 DraggableArea 내부에서 처리하거나 붙여서 표현 */
  border-bottom: 1px solid #ccc;
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

/* ★ 드래그 가능한 영역을 감싸는 Flex 박스 추가 */
const DraggableArea = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;
  /* Home 탭 바로 옆에 붙도록 설정 */
  margin-left: -1px;
`;

const TabItem = styled.div`
  min-width: ${(props) => (props.$isHome ? "50px" : "150px")};
  height: 39px;
  padding: ${(props) => (props.$isHome ? "0 10px" : "0 20px")};

  background-color: ${(props) =>
    props.$isDragging ? "#e2e6ea" : props.$active ? "#ffffff" : "#f8f9fa"};

  color: ${(props) => (props.$active ? "#000" : "#666")};
  font-weight: ${(props) => (props.$active ? "600" : "normal")};

  border: 1px solid #ccc;
  border-bottom: ${(props) =>
    props.$active ? "1px solid white" : "1px solid #ccc"};

  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isHome ? "center" : "space-between")};

  /* Home 탭이 아닐 때만 Grab 커서 적용 */
  cursor: ${(props) => (props.$isHome ? "pointer" : "grab")};

  font-size: 14px;
  margin-bottom: -1px;
  /* 탭끼리 겹치는 선 처리 (왼쪽으로 1px 당김) */
  margin-left: -1px;

  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#ffffff" : "#e2e6ea")};
  }

  &:active {
    cursor: ${(props) => (props.$isHome ? "pointer" : "grabbing")};
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
