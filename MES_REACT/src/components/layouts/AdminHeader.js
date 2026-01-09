import React from "react";
import styled from "styled-components";

const AdminHeader = () => {
  return (
    <Container>
      <Breadcrumb>MES Home</Breadcrumb>
      <RightSection>
        <span>Admin</span> {/* 우측 사용자 정보 예시 */}
      </RightSection>
    </Container>
  );
};

export default AdminHeader;

const Container = styled.div`
  height: 60px;
  background-color: #cdd2d9; /* 이미지의 회색 톤 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-sizing: border-box;
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
