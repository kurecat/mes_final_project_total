import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axios";
import {
  FaWarehouse,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaBox,
  FaThermometerHalf,
  FaExclamationTriangle,
  FaTools,
  FaTimes,
  FaMicrochip,
} from "react-icons/fa";

// --- Fallback Mock Data ---
const MOCK_LOCATIONS = [
  {
    id: "WH-RAW-A",
    name: "Raw Wafer Storage A",
    type: "RAW",
    condition: "Dry Box (23°C)",
    capacity: 1000,
    current: 450,
    status: "ACTIVE",
  },
  {
    id: "WH-CHEM-C",
    name: "Chemical Cold Storage",
    type: "RAW",
    condition: "Cold (4°C)",
    capacity: 200,
    current: 180,
    status: "ACTIVE",
  },
  {
    id: "WH-FAB-WIP",
    name: "Fab Line Stocker #1",
    type: "WIP",
    condition: "Clean Room",
    capacity: 500,
    current: 495,
    status: "FULL",
  },
  {
    id: "WH-EDS-BUF",
    name: "EDS Input Buffer",
    type: "WIP",
    condition: "N2 Purge",
    capacity: 300,
    current: 50,
    status: "ACTIVE",
  },
  {
    id: "WH-FG-DDR5",
    name: "DDR5 Module Warehouse",
    type: "FG",
    condition: "Normal",
    capacity: 5000,
    current: 1200,
    status: "ACTIVE",
  },
];

const defaultWarehouse = {
  code: "code",
  name: "name",
  type: "Main",
  address: "address",
  capacity: 1,
  mainParam: "mainParam",
};

// --- [Optimized] Sub-Components with React.memo ---

// 1. Control Bar Component
const ControlBarSection = React.memo(
  ({ filterType, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <ControlBar>
        <FilterGroup>
          {["ALL", "Main", "Sub", "ColdStorage", "CleanRoom"].map((type) => (
            <FilterBtn
              key={type}
              $active={filterType === type}
              onClick={() => onFilterChange(type)}
            >
              {type === "ALL"
                ? "All"
                : type === "Main"
                  ? "Main"
                  : type === "Sub"
                    ? "Sub"
                    : type === "ColdStorage"
                      ? "ColdStorage"
                      : "CleanRoom"}
            </FilterBtn>
          ))}
        </FilterGroup>
        <SearchBox>
          <FaSearch color="#999" />
          <input
            placeholder="Search Location..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </SearchBox>
      </ControlBar>
    );
  },
);

// 2. Location Card Item Component
const LocationCardItem = React.memo(({ loc, onDelete, onEdit }) => {
  const percent = Math.round((loc.occupancy / loc.capacity) * 100);
  const isFull = percent >= 95;

  return (
    <LocationCard $isFull={isFull}>
      <CardHeader>
        <LocType $type={loc.type}>{loc.type}</LocType>
        <LocCode>{loc.code}</LocCode>
        <EditIcon onClick={() => onEdit(loc)}>
          <FaEdit />
        </EditIcon>
      </CardHeader>

      <CardBody>
        <LocName>{loc.name}</LocName>
        <ConditionInfo>
          {loc.type.includes("Cold") ? (
            <FaThermometerHalf color="#3498db" />
          ) : loc.type.includes("Dry") ? (
            <FaBox color="#e67e22" />
          ) : (
            <FaWarehouse color="#999" />
          )}
          {loc.type}
        </ConditionInfo>

        <CapacityWrapper>
          <CapLabel>
            <span>Occupancy</span>
            <span className={isFull ? "full" : ""}>
              {percent}% ({loc.occupancy}/{loc.capacity})
            </span>
          </CapLabel>
          <ProgressBar>
            <ProgressFill $width={percent} $isFull={isFull} />
          </ProgressBar>
        </CapacityWrapper>
      </CardBody>

      <CardFooter>
        <StatusText $status={loc.status}>
          {isFull ? (
            <>
              <FaExclamationTriangle /> FULL
            </>
          ) : (
            "● AVAILABLE"
          )}
        </StatusText>
        <DeleteBtn onClick={() => onDelete(loc.id)}>
          <FaTrash />
        </DeleteBtn>
      </CardFooter>
    </LocationCard>
  );
});

const CrudModal = React.memo(
  ({ isEdit, formData, onChange, onAdd, onEdit, onClose }) => {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalBox onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              <FaTools />
              {isEdit ? "Edit Warehouse" : "Add Warehouse"}
            </ModalTitle>
            <CloseBtn onClick={onClose}>
              <FaTimes />
            </CloseBtn>
          </ModalHeader>

          <ModalBody>
            <SectionTitle>
              <FaMicrochip /> Warehouse Form
            </SectionTitle>
            <FormGrid>
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormInput
                  name="code"
                  value={formData.code}
                  placeholder="Warehouse code"
                  onChange={onChange}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormInput
                  name="name"
                  value={formData.name}
                  placeholder="Warehouse name"
                  onChange={onChange}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormSelect
                  name="type"
                  value={formData.type}
                  onChange={onChange}
                >
                  <option value="Main">Main</option>
                  <option value="Sub">Sub</option>
                  <option value="ColdStorage">ColdStorage</option>
                  <option value="CleanRoom">CleanRoom</option>
                </FormSelect>
              </FormItem>

              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormInput
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                ></FormInput>
              </FormItem>

              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormInput
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={onChange}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Occupancy</FormLabel>
                <FormInput
                  type="number"
                  name="occupancy"
                  value={formData.occupancy}
                  disabled
                />
              </FormItem>

              <FormItem style={{ gridColumn: "1 / -1" }}>
                <FormLabel>Main Param</FormLabel>
                <FormInput
                  name="param"
                  value={formData.param}
                  placeholder="ex) Pressure=3.2Torr"
                  onChange={onChange}
                />
              </FormItem>
            </FormGrid>
          </ModalBody>

          <ModalFooter>
            <ModalBtn
              className="close"
              onClick={() => {
                if (!isEdit) {
                  onAdd(formData); // 추가 시 formData만 전달
                } else {
                  onEdit(formData.id, formData); // 수정 시 id와 formData 전달
                }
                onClose();
              }}
            >
              {!isEdit ? "Add" : "Save"}
            </ModalBtn>
          </ModalFooter>
        </ModalBox>
      </ModalOverlay>
    );
  },
);

// --- Main Component ---

const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [reqFetch, setReqFetch] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  // 1. 데이터 조회 (READ) - useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API call logic...
      const res = await axiosInstance.get("/api/mes/master/warehouse/list");
      setLocations(res.data);

      // setTimeout(() => {
      //   setLocations(MOCK_LOCATIONS);
      //   setLoading(false);
      // }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setReqFetch(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, reqFetch]);

  // 2. Handlers - useCallback
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("이 위치 정보를 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/api/mes/master/warehouse/${id}`);
      setReqFetch(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleEdit = useCallback(async (id, formData) => {
    try {
      await axiosInstance.put(`/api/mes/master/warehouse/${id}`, formData);
      setReqFetch(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleAdd = useCallback(async (formData) => {
    try {
      await axiosInstance.post(`/api/mes/master/warehouse`, formData);
      setReqFetch(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedWarehouse((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleEditClick = useCallback((location) => {
    console.log(location);
    setEditingWarehouse(true);
    setIsModalOpen(true);
    setSelectedWarehouse(location);
  }, []);

  const handleAddClick = useCallback(() => {
    setEditingWarehouse(false);
    setIsModalOpen(true);
    setSelectedWarehouse({ ...defaultWarehouse });
  }, []);

  const closeCrudModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWarehouse(null);
  }, []);

  // 3. Filtering - useMemo
  const filteredList = useMemo(() => {
    return locations.filter((loc) => {
      const matchType = filterType === "ALL" || loc.type === filterType;
      const matchSearch =
        loc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [locations, filterType, searchTerm]);

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TitleArea>
          <PageTitle>
            <FaWarehouse /> Warehouse Location Master
            {loading && (
              <FaSync
                className="spin"
                style={{ fontSize: 14, marginLeft: 10 }}
              />
            )}
          </PageTitle>
          <SubTitle>Manage Storage Zones & Capacity</SubTitle>
        </TitleArea>
        <ActionGroup>
          <AddButton onClick={handleAddClick}>
            <FaPlus /> Add Location
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

      {/* 위치 카드 그리드 */}
      <GridContainer>
        {filteredList.map((loc) => (
          <LocationCardItem
            key={loc.id}
            loc={loc}
            onDelete={handleDelete}
            onEdit={handleEditClick}
          />
        ))}
      </GridContainer>
      {}
      {isModalOpen && (
        <CrudModal
          isEdit={!!editingWarehouse}
          formData={selectedWarehouse}
          onChange={handleChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onClose={closeCrudModal}
        />
      )}
    </Container>
  );
};

export default LocationPage;

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
`;

const LocationCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid ${(props) => (props.$isFull ? "#e74c3c" : "#eee")};
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 15px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const LocType = styled.span`
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(props) =>
    props.$type === "Main"
      ? "#e8f5e9" // 연한 초록 배경
      : props.$type === "Sub"
        ? "#fff3e0" // 연한 주황 배경
        : props.$type === "ColdStorage"
          ? "#e0f7fa" // 연한 청록 배경
          : props.$type === "CleanRoom"
            ? "#f3e5f5" // 연한 보라 배경
            : "#e3f2fd"}; // 기본값 (연한 파랑)

  color: ${(props) =>
    props.$type === "Main"
      ? "#2e7d32" // 진한 초록 글자
      : props.$type === "Sub"
        ? "#e67e22" // 주황 글자
        : props.$type === "ColdStorage"
          ? "#006064" // 청록 글자
          : props.$type === "CleanRoom"
            ? "#6a1b9a" // 보라 글자
            : "#1976d2"}; // 기본값 (파랑 글자)
`;
const LocCode = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 14px;
`;
const EditIcon = styled.div`
  color: #999;
  cursor: pointer;
  &:hover {
    color: #1a4f8b;
  }
`;

const CardBody = styled.div`
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const LocName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;
const ConditionInfo = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CapacityWrapper = styled.div`
  margin-top: 5px;
`;
const CapLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
  .full {
    color: #e74c3c;
    font-weight: 700;
  }
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background-color: ${(props) => (props.$isFull ? "#e74c3c" : "#2ecc71")};
`;

const CardFooter = styled.div`
  padding: 12px 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const StatusText = styled.span`
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => (props.$status === "FULL" ? "#e74c3c" : "#2ecc71")};
`;
const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    color: #e74c3c;
  }
`;

/* Modal Styles */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  width: 760px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #888;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 14px 0;
  overflow-y: auto;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #1a4f8b;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalFooter = styled.div`
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const ModalBtn = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;

  &.close {
    background: #1a4f8b;
    color: white;
  }

  &:hover {
    opacity: 0.9;
  }
`;

/* CRUD Form */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #666;
`;

const FormInput = styled.input`
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 12px;
  outline: none;

  &:focus {
    border-color: #1a4f8b;
  }
`;

const FormSelect = styled.select`
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  background: white;

  &:focus {
    border-color: #1a4f8b;
  }
`;
