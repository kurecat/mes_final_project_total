import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios.js";
import {
  FaSearch,
  FaSitemap,
  FaCube,
  FaCubes,
  FaPlus,
  FaEdit,
  FaFileExport,
  FaFlask,
  FaMicrochip,
  FaSync,
} from "react-icons/fa";

/* =========================================================================
   Styled Components (Defined top-level to avoid ReferenceError in sub-components)
   ========================================================================= */

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f6fa;
  display: flex;
  box-sizing: border-box;
`;

const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;
const Title = styled.h2`
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #eee;
  input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 100%;
    font-size: 14px;
  }
`;

const BomList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const BomItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  background-color: ${(props) => (props.$active ? "#eef2f8" : "white")};
  border-left: 4px solid
    ${(props) => (props.$active ? "#1a4f8b" : "transparent")};
  &:hover {
    background-color: #f9f9f9;
  }
`;

const ItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;
const ItemName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;
const ItemBottom = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
`;
const StatusBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === "ACTIVE" ? "#e8f5e9" : "#eee"};
  color: ${(props) => (props.$status === "ACTIVE" ? "#2e7d32" : "#888")};
`;

const AddButton = styled.button`
  margin: 15px;
  padding: 12px;
  background-color: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #133b6b;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const HeaderLeft = styled.div``;
const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
`;

const ProductName = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const RevBadge = styled.span`
  font-size: 12px;
  background-color: #333;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  vertical-align: middle;
`;
const ProductMeta = styled.div`
  margin-top: 5px;
  font-size: 13px;
  color: #666;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.$primary ? "#1a4f8b" : "#ddd")};
  background-color: ${(props) => (props.$primary ? "#1a4f8b" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#333")};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
`;

const BomTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  thead {
    background-color: #f1f3f5;
    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #555;
      font-weight: 700;
      border-bottom: 1px solid #ddd;
    }
  }
  tbody {
    tr {
      border-bottom: 1px solid #eee;
      &:hover {
        background-color: #f8fbff;
      }
    }
    td {
      padding: 12px;
      font-size: 14px;
      color: #333;
      vertical-align: middle;
      &.name {
        font-weight: 600;
      }
    }
  }
`;

const RootRow = styled.tr`
  background-color: #fffde7 !important;
  font-weight: bold;
`;
const Indent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: ${(props) => (props.$level - 1) * 20}px;
`;
const LCorner = styled.div`
  width: 10px;
  height: 10px;
  border-left: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const TypeLabel = styled.span`
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "ASSY"
      ? "#fff3e0"
      : props.$type === "CHEM"
        ? "#ffebee"
        : props.$type === "FG"
          ? "#e8f5e9"
          : "#e3f2fd"};
  color: ${(props) =>
    props.$type === "ASSY"
      ? "#e67e22"
      : props.$type === "CHEM"
        ? "#c62828"
        : props.$type === "FG"
          ? "#2e7d32"
          : "#1976d2"};
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
`;

/* =========================================================================
   Optimized Sub-Components
   ========================================================================= */

// 1. Sidebar Item Component (Memoized)
const SidebarItem = React.memo(({ product, isActive, onClick }) => {
  return (
    <BomItem $active={isActive} onClick={() => onClick(product)}>
      <ItemTop>
        <ItemName>{product.name}</ItemName>
        <StatusBadge $status={product.status}>{product.status}</StatusBadge>
      </ItemTop>
      <ItemBottom>
        <span>{product.code}</span>
        <span>{product.revision}</span>
      </ItemBottom>
    </BomItem>
  );
});

// 2. Sidebar Panel Component (Memoized)
const SidebarPanel = React.memo(
  ({
    loading,
    searchTerm,
    onSearchChange,
    filteredProducts,
    selectedProductId,
    onSelect,
  }) => {
    return (
      <Sidebar>
        <SidebarHeader>
          <Title>
            <FaSitemap /> Product BOMs
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 12, marginLeft: 8 }}
              />
            )}
          </Title>
          <SearchBox>
            <FaSearch color="#999" />
            <input
              placeholder="Search Product..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </SearchBox>
        </SidebarHeader>

        <BomList>
          {filteredProducts.map((product) => (
            <SidebarItem
              key={product.id}
              product={product}
              isActive={selectedProductId === product.id}
              onClick={onSelect}
            />
          ))}
        </BomList>

        <AddButton>
          <FaPlus /> New Product BOM
        </AddButton>
      </Sidebar>
    );
  },
);

// 3. Detail View - Table Row (Memoized)
const BomTableRow = React.memo(({ bomItem }) => {
  return (
    <tr>
      <td style={{ textAlign: "center", color: "#888" }}>{1}</td>
      <td style={{ fontFamily: "monospace", color: "#555" }}>
        {bomItem.materialCode}
      </td>
      <td className="name">
        <Indent $level={1}>
          <LCorner />
          {/* 자재 타입별 아이콘 분기 */}
          {bomItem.category === "CHEM" ? (
            <FaFlask color="#e74c3c" size={12} style={{ marginRight: 5 }} />
          ) : bomItem.category === "ASSY" ? (
            <FaMicrochip color="#f39c12" size={12} style={{ marginRight: 5 }} />
          ) : (
            <FaCube color="#3498db" size={12} style={{ marginRight: 5 }} />
          )}
          <span>{bomItem.materialName}</span>
        </Indent>
      </td>
      <td>
        <TypeLabel $category={bomItem.category}>{bomItem.category}</TypeLabel>
      </td>
      <td style={{ fontWeight: "600" }}>{bomItem.quantity}</td>
      <td style={{ color: "#666" }}>{bomItem.unit}</td>
    </tr>
  );
});

// 4. Detail View Component (Memoized)
const DetailView = React.memo(({ product, bom }) => {
  if (!product)
    return <EmptyState>Select a Product to view details</EmptyState>;

  return (
    <>
      <DetailHeader>
        <HeaderLeft>
          <ProductName>
            {product.name} <RevBadge>{product.revision}</RevBadge>
          </ProductName>
          <ProductMeta>
            Code: <strong>{product.code}</strong> | Type: {product.type} | Last
            Updated: {product.lastUpdated}
          </ProductMeta>
        </HeaderLeft>
        <HeaderRight>
          <ActionButton>
            <FaEdit /> Revision Change
          </ActionButton>
          <ActionButton $primary>
            <FaFileExport /> Export Excel
          </ActionButton>
        </HeaderRight>
      </DetailHeader>

      <TableContainer>
        <BomTable>
          <thead>
            <tr>
              <th width="5%">Lv.</th>
              <th width="25%">Material Code</th>
              <th width="25%">Material Name</th>
              <th width="10%">Type</th>
              <th width="10%">Qty</th>
              <th width="10%">Unit</th>
            </tr>
          </thead>
          <tbody>
            {/* Root Item */}
            <RootRow>
              <td>0</td>
              <td>{product.code}</td>
              <td className="name">
                <FaCubes style={{ marginRight: 8, color: "#1a4f8b" }} />
                {product.name}
              </td>
              <td>
                <TypeLabel $type="FG">FG</TypeLabel>
              </td>
              <td>1</td>
              <td>ea</td>
            </RootRow>
            {/* Children Items */}
            {bom &&
              bom.map((child) => (
                <BomTableRow key={child.id} bomItem={child} />
              ))}
          </tbody>
        </BomTable>
      </TableContainer>
    </>
  );
});

/* =========================================================================
   Main Component
   ========================================================================= */

const BomPage = () => {
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // [Optimization] fetchData with useCallback
  const fetchProductList = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      const res = await axiosInstance.get(
        "http://localhost:8111/api/mes/master/product/list",
      );
      setProductList(res.data);
      if (res.data.length > 0) setSelectedProduct(res.data[0]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchBom = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedProduct) {
        // API call logic...
        const productId = selectedProduct.id;
        const res = await axiosInstance.get(
          `http://localhost:8111/api/mes/master/bom/${productId}`,
        );
        setBom(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  useEffect(() => {
    fetchBom();
  }, [fetchBom]);

  // [Optimization] Handlers with useCallback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectProduct = useCallback((bom) => {
    setSelectedProduct(bom);
  }, []);

  // [Optimization] Filtering with useMemo
  const filteredProducts = useMemo(() => {
    return productList.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [productList, searchTerm]);

  return (
    <Container>
      {/* 1. Sidebar Panel */}
      <SidebarPanel
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredProducts={filteredProducts}
        selectedProductId={selectedProduct?.id}
        onSelect={handleSelectProduct}
      />

      {/* 2. Detail View */}
      <ContentArea>
        <DetailView product={selectedProduct} bom={bom} />
      </ContentArea>
    </Container>
  );
};

export default BomPage;
