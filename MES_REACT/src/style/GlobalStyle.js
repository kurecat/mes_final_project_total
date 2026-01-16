// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* 1. Reset CSS */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 2. Body & Font Setting */
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    background-color: #f5f6fa;
    color: #333;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased; /* 폰트 부드럽게 */
    -moz-osx-font-smoothing: grayscale;
  }

  /* 3. Scrollbar Customizing (Webkit) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1; 
  }
  ::-webkit-scrollbar-thumb {
    background: #ccc; 
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #aaa; 
  }

  /* 4. Common Elements */
  a { text-decoration: none; color: inherit; }
  ul, li { list-style: none; }
  button { font-family: inherit; }
`;

export default GlobalStyle;
