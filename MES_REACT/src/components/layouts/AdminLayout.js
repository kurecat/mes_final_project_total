// import React from "react";
// import styled from "styled-components";
// import { Outlet } from "react-router-dom";
// import AdminSiderBar from "../components/common/AdminSideBar";
// import AdminHeader from "../components/common/AdminHeader";

// const Layout = () => {
//   return (
//     <PageBackground>
//       <AppContainer>
//         {/* 왼쪽 사이드바 */}
//         <AdminSiderBar />

//         {/* 오른쪽 메인 영역 (헤더 + 콘텐츠) */}
//         <MainWrapper>
//           <AdminHeader />
//           <ContentArea>
//             <WhiteBox>
//               <Outlet />
//             </WhiteBox>
//           </ContentArea>
//         </MainWrapper>
//       </AppContainer>
//     </PageBackground>
//   );
// };

// export default Layout;

// // --- 스타일 컴포넌트 ---

// // 1. 전체 페이지 배경 (브라우저 화면 전체)
// const PageBackground = styled.div`
//   width: 100vw;
//   height: 100vh;
//   background-color: #e0e0e0; /* 배경색을 조금 더 진하게 해서 구분이 잘 가게 함 */
//   display: flex;
//   justify-content: center;
//   overflow: auto; /* 화면이 작으면 스크롤 생성 */
// `;

// // 2. 앱 전체 컨테이너 (1920x1080 고정)
// const AppContainer = styled.div`
//   /* 핵심: 크기 고정 */
//   width: 1920px;
//   height: 1080px;
//   border-radius: 20px; /* 전체 둥근 모서리 */
//   min-width: 1920px;
//   min-height: 1080px;
//   flex-shrink: 0;

//   background-color: white;
//   display: flex;
//   overflow: hidden; /* 내부 요소가 튀어나오지 않게 */
//   box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); /* 입체감 */
// `;

// // 3. 오른쪽 메인 영역
// const MainWrapper = styled.div`
//   flex: 1; /* 남은 너비 (1920 - 사이드바너비) 차지 */
//   display: flex;
//   flex-direction: column;
//   background-color: #fcfcfc;
// `;

// // 4. 콘텐츠 영역
// const ContentArea = styled.div`
//   flex: 1; /* 남은 높이 (1080 - 헤더높이) 차지 */
//   padding: 30px; /* 내부 여백 */
//   box-sizing: border-box;
//   background-color: #fcfcfc;
// `;

// // 5. 흰색 박스 (실제 대시보드 내용 들어가는 곳)
// const WhiteBox = styled.div`
//   width: 100%;
//   height: 100%;
//   background-color: white;
//   border: 1px solid #ddd;
//   border-radius: 10px; /* 둥근 모서리 살짝 */
//   padding: 20px;
//   box-sizing: border-box;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
//   overflow: auto; /* 내용이 많으면 박스 안에서만 스크롤 */
// `;
