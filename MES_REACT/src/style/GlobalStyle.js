// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* 1. 폰트 설정 (구글 폰트 Noto Sans KR 불러오기) */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  /* 2. 기본 스타일 초기화 (Reset CSS) */
  * {
    box-sizing: border-box; /* 패딩/테두리가 너비에 포함되도록 설정 (가장 중요) */
    margin: 0;
    padding: 0;
  }

  /* 3. 전체 바디 스타일 */
  body {
    font-family: 'Noto Sans KR', sans-serif; /* 기본 폰트 적용 */
    background-color: #f4f4f4; /* 배경색 통일 */
    color: #333; /* 기본 글자색 */
    line-height: 1.5;
    overflow: hidden; /* 전체 화면 스크롤 방지 (Layout 내부 스크롤 사용 시) */
  }

  /* 4. 링크 스타일 제거 */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* 5. 리스트 스타일 제거 */
  ul, li {
    list-style: none;
  }

  /* 6. 버튼 기본 스타일 제거 및 포인터 */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  
  /* 7. 입력창 폰트 상속 */
  input, textarea, select {
    font-family: inherit;
  }
`;

export default GlobalStyle;
