import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
`;

const StandardPage = () => {
  return (
    <Container>
      <p>검사 기준 설정 페이지</p>
    </Container>
  );
};

export default StandardPage;
