import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdClose, IoIosHome } from "react-icons/io"; // ★ IoIosHome 추가
import { FaSignOutAlt, FaClock } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const AdminHeader = ({ tabs, removeTab, onDragEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  const HOME_PATH = "/admin";
  const homeTab = tabs.find((tab) => tab.path === HOME_PATH);
  const otherTabs = tabs.filter((tab) => tab.path !== HOME_PATH);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onDragEnd(result);
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/");
    }
  };

  return (
    <Container>
      <Menubar>
        <Breadcrumb>MES System Management</Breadcrumb>
        <RightSection>
          <ClockItem>
            <FaClock size={14} style={{ marginRight: 6 }} />
            {currentTime.toLocaleTimeString()}
          </ClockItem>
          <Divider />
          <HeaderBtn onClick={handleLogout} title="Logout" $logout>
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </HeaderBtn>
        </RightSection>
      </Menubar>

      <Toolbar>
        {/* ★ Home 탭: 아이콘 변경 (IoIosHome) */}
        {homeTab ? (
          <HomeTabItem
            $active={location.pathname === HOME_PATH}
            onClick={() => navigate(HOME_PATH)}
            title="Dashboard"
          >
            <IoIosHome size={18} />
          </HomeTabItem>
        ) : null}

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
