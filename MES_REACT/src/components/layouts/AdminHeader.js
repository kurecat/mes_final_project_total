// src/components/layouts/AdminHeader.js
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
} from "react-icons/io";
import { FaSignOutAlt, FaClock } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

const AdminHeader = ({ tabs, removeTab, onDragEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: null, desc: "", icon: "" });
  const API_KEY = "5b6a625b25065e038c9a33e0674ea4e6";

  // ★ [수정] AdminMainPage의 탭 경로와 정확히 일치시켜야 고정됩니다.
  const HOME_PATH = "/admin/dashboard";

  // 홈 탭과 일반 탭 분리
  const homeTab = tabs.find((tab) => tab.path === HOME_PATH);
  const otherTabs = tabs.filter((tab) => tab.path !== HOME_PATH);

  // 날씨 API
  useEffect(() => {
    const fetchWeather = async () => {
      if (!API_KEY) return;
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=36.815&lon=127.113&units=metric&appid=${API_KEY}`;
        const res = await axios.get(url);
        setWeather({
          temp: Math.round(res.data.main.temp * 10) / 10,
          desc: res.data.weather[0].main,
          icon: res.data.weather[0].icon,
        });
      } catch (err) {
        console.warn("Weather API Failed, using mock data.");
        setWeather({ temp: 22.5, desc: "Sunny", icon: "01d" });
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);
    return () => clearInterval(interval);
  }, []);

  const renderWeatherIcon = (code) => {
    if (!code) return <IoMdSunny />;
    if (code.startsWith("01")) return <IoMdSunny color="#f39c12" />;
    if (code.startsWith("02") || code.startsWith("03"))
      return <IoMdCloudy color="#bdc3c7" />;
    if (code.startsWith("09") || code.startsWith("10"))
      return <IoMdRainy color="#3498db" />;
    if (code.startsWith("13")) return <IoMdSnow color="#ecf0f1" />;
    return <IoMdCloudy color="#95a5a6" />;
  };

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
          <WeatherItem>
            {renderWeatherIcon(weather.icon)}
            <span>{weather.temp}°C</span>
            <span className="desc">({weather.desc})</span>
          </WeatherItem>
          <Divider />
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
        {/* ★ 홈 탭 (고정): ScrollContainer 바깥에 배치하여 스크롤되지 않음 */}
        {homeTab && (
          <HomeTabItem
            $active={location.pathname === HOME_PATH}
            onClick={() => navigate(HOME_PATH)}
            title="Dashboard"
          >
            <IoIosHome size={22} />
          </HomeTabItem>
        )}

        {/* 나머지 탭 (스크롤 및 드래그 가능 영역) */}
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
                          {/* 닫기 버튼: closable이 false가 아닐 때만 표시 */}
                          {tab.closable !== false && (
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
                          )}
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

// --- 스타일 컴포넌트 ---

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
  /* padding-left 제거 */
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

// ★ 홈 탭 스타일 (고정, flex-shrink: 0 필수)
const HomeTabItem = styled(BaseTabItem)`
  min-width: 70px; /* 너비 조절 */
  width: 45px;
  padding: 0;
  justify-content: center;
  flex-shrink: 0; /* ★ 중요: 스크롤 영역에 의해 줄어들지 않도록 고정 */
  z-index: 10;
  border-right: 1px solid #bbb;
  margin-left: 0;
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
