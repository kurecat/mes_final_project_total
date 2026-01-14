// src/pages/dashboard/KPIPage.js
import React, { useState } from "react";
import styled from "styled-components";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { FaSearch, FaCalendarAlt, FaDownload } from "react-icons/fa";

// --- Mock Data (일별 추이) ---
const OEE_TREND_DATA = [
  { date: "01/01", oee: 82, availability: 90, performance: 95, quality: 96 },
  { date: "01/02", oee: 85, availability: 92, performance: 94, quality: 98 },
  { date: "01/03", oee: 78, availability: 80, performance: 96, quality: 99 }, // 설비 고장 발생일
  { date: "01/04", oee: 88, availability: 95, performance: 95, quality: 97 },
  { date: "01/05", oee: 90, availability: 96, performance: 96, quality: 98 },
  { date: "01/06", oee: 89, availability: 94, performance: 97, quality: 97 },
  { date: "01/07", oee: 92, availability: 98, performance: 98, quality: 96 },
];

const DEFECT_PARETO_DATA = [
  { name: "치수 불량", count: 120, accumulated: 40 },
  { name: "스크래치", count: 80, accumulated: 65 },
  { name: "도장 불량", count: 50, accumulated: 80 }, // 누적 80% 지점
  { name: "찍힘", count: 30, accumulated: 90 },
  { name: "기타", count: 20, accumulated: 100 },
];

const KPIPage = () => {
  const [startDate, setStartDate] = useState("2024-05-01");
  const [endDate, setEndDate] = useState("2024-05-07");

  return (
    <Container>
      {/* 1. 검색 및 필터 영역 */}
      <FilterSection>
        <PageTitle>생산 효율 분석 (OEE Analytics)</PageTitle>
        <ControlGroup>
          <DateInputGroup>
            <FaCalendarAlt color="#666" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </DateInputGroup>
          <SearchButton>
            <FaSearch /> 조회
          </SearchButton>
          <DownloadButton>
            <FaDownload /> 엑셀 다운로드
          </DownloadButton>
        </ControlGroup>
      </FilterSection>

      {/* 2. OEE 종합 트렌드 (메인 차트) */}
      <MainChartSection>
        <SectionTitle>일별 OEE (종합 설비 효율) 추이</SectionTitle>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={OEE_TREND_DATA}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="availability"
                name="가동률"
                barSize={20}
                fill="#8884d8"
              />
              <Bar
                dataKey="performance"
                name="성능 효율"
                barSize={20}
                fill="#413ea0"
              />
              <Bar
                dataKey="quality"
                name="양품률"
                barSize={20}
                fill="#82ca9d"
              />
              <Line
                type="monotone"
                dataKey="oee"
                name="OEE Score"
                stroke="#ff7300"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </MainChartSection>

      {/* 3. 하단 상세 분석 (좌: 불량 분석, 우: 생산량 추이) */}
      <BottomSection>
        <SubChartBox>
          <SectionTitle>불량 유형 분석 (Pareto Chart)</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={DEFECT_PARETO_DATA}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#ff7300"
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                name="발생 건수"
                barSize={40}
                fill="#413ea0"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accumulated"
                name="누적 점유율(%)"
                stroke="#ff7300"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </SubChartBox>

        <SubChartBox>
          <SectionTitle>주간 생산량 달성 추이</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={OEE_TREND_DATA}>
              <defs>
                <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="performance"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorOee)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SubChartBox>
      </BottomSection>
    </Container>
  );
};

export default KPIPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FilterSection = styled.div`
  height: 60px;
  background-color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const DateInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;

  span {
    color: #888;
  }
`;

const Input = styled.input`
  border: none;
  background: transparent;
  color: #333;
  font-family: inherit;
  cursor: pointer;
  outline: none;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  transition: 0.2s;
`;

const SearchButton = styled(Button)`
  background-color: #1a4f8b;
  color: white;
  &:hover {
    background-color: #133b6b;
  }
`;

const DownloadButton = styled(Button)`
  background-color: #2e7d32;
  color: white;
  &:hover {
    background-color: #1b5e20;
  }
`;

const MainChartSection = styled.div`
  flex: 1.5; /* 세로 비율 1.5 */
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 0; /* Flex overflow 방지 */
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #555;
  margin: 0 0 15px 0;
  font-weight: 700;
`;

const ChartContainer = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
`;

const BottomSection = styled.div`
  flex: 1; /* 세로 비율 1 */
  display: flex;
  gap: 20px;
  min-height: 0;
`;

const SubChartBox = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;
