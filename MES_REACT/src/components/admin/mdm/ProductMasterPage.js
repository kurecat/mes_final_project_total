import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaBox,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSync,
  FaBarcode,
  FaCheck,
} from "react-icons/fa";

// --- [Optimized] Sub-Components with React.memo ---

// 1. Control Bar Component

const categoryLabels = {
  ALL: "ALL",
  DRAM: "DRAM",
  CPU: "CPU",
  ANA: "ANLG",
  LED: "LED",
  SEN: "SNSR",
  COM: "COMM",
  AUTO: "AUTO",
};

const ControlBarSection = React.memo(
  ({ filterType, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <ControlBar>
        <FilterGroup>
          {Object.keys(categoryLabels).map((category) => (
            <FilterBtn
              key={category}
              $active={filterType === category}
              onClick={() => onFilterChange(category)}
            >
              {categoryLabels[category]}
            </FilterBtn>
          ))}
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Code or Name..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
      </ControlBar>
    );
  },
);

// 2. Table Row Component
const ProductTableRow = React.memo(
  ({ product, onDelete, onEdit, editingId, editValues, onChangeEdit }) => {
    const isEditing = editingId === product.id;

    return (
      <tr>
        <td
          style={{
            fontFamily: "monospace",
            color: "#1a4f8b",
            fontWeight: "bold",
          }}
        >
          <FaBarcode style={{ marginRight: 5, color: "#999" }} />
          {isEditing ? (
            <InlineInput
              value={editValues.code || ""}
              placeholder={product.code}
              onChange={(e) => onChangeEdit("code", e.target.value)}
            />
          ) : (
            product.code
          )}
        </td>
        <td style={{ fontWeight: "600" }}>
          {isEditing ? (
            <InlineInput
              value={editValues.name || ""}
              placeholder={product.name}
              onChange={(e) => onChangeEdit("name", e.target.value)}
            />
          ) : (
            product.name
          )}
        </td>
        <td>
          {isEditing ? (
            <InlineSelect
              value={editValues.category || ""}
              onChange={(e) => onChangeEdit("category", e.target.value)}
            >
              {Object.entries(categoryLabels)
                .filter(([key]) => key !== "ALL")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </InlineSelect>
          ) : (
            <TypeBadge $category={product.category}>
              {product.category}
            </TypeBadge>
          )}
        </td>
        <td style={{ color: "#555" }}>
          {isEditing ? (
            <InlineInput
              value={editValues.spec || ""}
              placeholder={product.spec}
              onChange={(e) => onChangeEdit("spec", e.target.value)}
            />
          ) : (
            product.spec
          )}
        </td>
        <td className="center">
          {isEditing ? (
            <IconButton className="edit" onClick={() => onEdit(product)}>
              <FaCheck />
            </IconButton>
          ) : (
            <IconButton className="edit" onClick={() => onEdit(product)}>
              <FaEdit />
            </IconButton>
          )}
          <IconButton className="del" onClick={() => onDelete(product.id)}>
            <FaTrash />
          </IconButton>
        </td>
      </tr>
    );
  },
);

// --- Main Component ---

const ProductMasterPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [reqFetch, setReqFetch] = useState(false);

  const handleEdit = useCallback(
    async (product) => {
      if (editingId === product.id) {
        // 완료 → PUT 요청
        try {
          await axiosInstance.put(
            `http://localhost:8111/api/mes/master/product/${product.id}`,
            { ...product, ...editValues },
          );
          // setProducts((prev) =>
          //   prev.map((p) =>
          //     p.id === product.id ? { ...p, ...editValues } : p,
          //   ),
          // );
          setEditingId(null);
          setEditValues({});
          setReqFetch(true);
        } catch (err) {
          console.error("Update Error", err);
        }
      } else {
        // 수정 시작
        setEditingId(product.id);
        setEditValues({
          code: product.code,
          name: product.name,
          category: product.category,
          spec: product.spec,
        });
      }
    },
    [editingId, editValues],
  );

  const handleChangeEdit = useCallback((field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 1. 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      const res = await axiosInstance.get("/api/mes/master/product/list");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setReqFetch(false);
    }
  }, []);

  // 2. Handlers - useCallback
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`품목 코드 [${id}]를 삭제하시겠습니까?`)) return;
    setLoading(true);
    try {
      await axiosInstance.delete(
        `http://localhost:8111/api/mes/master/product/${id}`,
      );
      // setProducts((prev) => prev.filter((product) => product.id !== id));
      setReqFetch(true);
    } catch (err) {
      console.error("Delete Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = useCallback(async () => {
    setLoading(true);
    const newProduct = {
      code: `ITM-NEW-0000`,
      name: "New Product Entry",
      category: "ROH",
      spec: "TBD",
    };
    try {
      await axiosInstance.post(`/api/mes/master/product`, newProduct);
    } catch (err) {
      console.error("Create Error", err);
    } finally {
      setLoading(false);
      setReqFetch(true);
    }
  }, []);

  const handleFilterChange = useCallback((category) => {
    setFilterType(category);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, reqFetch]);

  // 3. Filtering - useMemo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchType = filterType === "ALL" || product.category === filterType;
      const matchSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [products, filterType, searchTerm]);

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaBox /> Product Master Information
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Standard Information for Product, Assy, Material</SubTitle>
        </TitleArea>
        <ActionGroup>
          <AddButton onClick={handleAdd}>
            <FaPlus /> New Product
          </AddButton>
        </ActionGroup>
      </Header>

      {/* 컨트롤 바 (Memoized) */}
      <ControlBarSection
        filterType={filterType}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* 테이블 영역 */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="25%">Product Code</th>
              <th width="25%">Product Name</th>
              <th width="11%">Type</th>
              <th width="25%">Specification</th>
              <th width="7%" className="center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onEdit={handleEdit}
                editingId={editingId}
                editValues={editValues}
                onChangeEdit={handleChangeEdit}
              />
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductMasterPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  .spin {
    animation: spin 1s linear infinite;
    color: #aaa;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const SubTitle = styled.span`
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  margin-left: 34px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;
const AddButton = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #133b6b;
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;
const FilterGroup = styled.div`
  flex-wrap: wrap;
  display: flex;
  gap: 8px;
`;
const FilterBtn = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$active ? "#1a4f8b" : "#eee")};
  background: ${(props) => (props.$active ? "#1a4f8b" : "#f9f9f9")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  &:hover {
    background: ${(props) => (props.$active ? "#133b6b" : "#eee")};
  }
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 200px;
    font-size: 14px;
  }
`;

const TableContainer = styled.div`
  max-height: calc(100vh - 340px);
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  thead {
    th {
      text-align: left;
      padding: 12px;
      background: #f9f9f9;
      color: #666;
      border-bottom: 2px solid #eee;
      font-weight: 700;
    }
    th.center {
      text-align: center;
    }
  }
  tbody {
    tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
      &:hover {
        background: #f8fbff;
      }
    }
    td {
      padding: 12px;
      color: #333;
      vertical-align: middle;
    }
    td.center {
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
  }
`;

const TypeBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$category === "FERT"
      ? "#e3f2fd"
      : props.$category === "HALB"
        ? "#fff3e0"
        : "#f3e5f5"};
  color: ${(props) =>
    props.$category === "FERT"
      ? "#1976d2"
      : props.$category === "HALB"
        ? "#e67e22"
        : "#7b1fa2"};
`;
const UnitBadge = styled.span`
  font-size: 11px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  &:hover {
    background: #f5f5f5;
  }
  &.edit:hover {
    color: #1a4f8b;
    border-color: #1a4f8b;
  }
  &.del:hover {
    color: #e74c3c;
    border-color: #e74c3c;
  }
`;

const InlineInput = styled.input`
  width: calc(100% - 20px);
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:focus {
    outline: none;
    border-color: #1a4f8b;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(26, 79, 139, 0.1);
  }

  &::placeholder {
    color: #aaa;
    font-size: 13px;
  }
`;

const InlineSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:focus {
    outline: none;
    border-color: #1a4f8b;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(26, 79, 139, 0.1);
  }

  option {
    font-size: 14px;
    color: #333;
    background: #fff;
  }
`;
