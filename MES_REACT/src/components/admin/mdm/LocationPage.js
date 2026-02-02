import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
// import axiosInstance from "../../api/axios"; // 실제 API 연동 시 주석 해제
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
  FaTimes,
  FaSave,
} from "react-icons/fa";

// --- [Mock Data] 초기 데이터 ---
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

/* =========================================================================
   Sub-Components (렌더링 최적화)
   ========================================================================= */

// 1. 상단 검색 및 필터 바
const ControlBarSection = React.memo(
  ({ filterType, onFilterChange, searchTerm, onSearchChange }) => {
    return (
      <ControlBar>
        <FilterGroup>
          {["ALL", "RAW", "WIP", "FG"].map((type) => (
            <FilterBtn
              key={type}
              $active={filterType === type}
              onClick={() => onFilterChange(type)}
            >
              {type === "ALL"
                ? "All"
                : type === "RAW"
                  ? "Raw Material"
                  : type === "WIP"
                    ? "WIP (Stocker)"
                    : "Finished Goods"}
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

// 2. 개별 위치 카드
const LocationCardItem = React.memo(({ loc, onDelete, onEdit }) => {
  const percent = Math.round((loc.current / loc.capacity) * 100);
  const isFull = percent >= 95;

  return (
    <LocationCard $isFull={isFull}>
      <CardHeader>
        <LocType $type={loc.type}>{loc.type}</LocType>
        <LocId>{loc.id}</LocId>
        <EditIcon onClick={() => onEdit(loc.id)}>
          <FaEdit />
        </EditIcon>
      </CardHeader>

      <CardBody>
        <LocName>{loc.name}</LocName>
        <ConditionInfo>
          {loc.condition.includes("Cold") ? (
            <FaThermometerHalf color="#3498db" />
          ) : loc.condition.includes("Dry") ? (
            <FaBox color="#e67e22" />
          ) : (
            <FaWarehouse color="#999" />
          )}
          {loc.condition}
        </ConditionInfo>

        <CapacityWrapper>
          <CapLabel>
            <span>Occupancy</span>
            <span className={isFull ? "full" : ""}>
              {percent}% ({loc.current}/{loc.capacity})
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

/* =========================================================================
   Main Component
   ========================================================================= */

const LocationPage = () => {
  // --- State: Data & UI ---
  const [locations, setLocations] = useState(MOCK_LOCATIONS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // --- State: Modal (Add & Edit 통합) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("ADD"); // "ADD" or "EDIT"
  const [newLocation, setNewLocation] = useState({
    id: "",
    name: "",
    type: "RAW",
    condition: "Normal",
    capacity: 1000,
    current: 0,
    status: "ACTIVE",
  });

  // 1. 데이터 조회 (Simulated API)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // API 호출 대기 시뮬레이션
      setTimeout(() => {
        setLocations(MOCK_LOCATIONS);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handlers: CRUD
  const handleDelete = useCallback((id) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  }, []);

  // [추가 버튼] 클릭 핸들러
  const handleAdd = useCallback(() => {
    setNewLocation({
      id: "",
      name: "",
      type: "RAW",
      condition: "Normal",
      capacity: 1000,
      current: 0,
      status: "ACTIVE",
    });
    setModalMode("ADD");
    setIsModalOpen(true);
  }, []);

  // [수정 버튼] 클릭 핸들러
  const handleEdit = useCallback(
    (id) => {
      const target = locations.find((loc) => loc.id === id);
      if (target) {
        setNewLocation({ ...target }); // 기존 데이터 복사
        setModalMode("EDIT");
        setIsModalOpen(true);
      }
    },
    [locations],
  );

  // [저장/업데이트] 핸들러
  const handleSaveLocation = () => {
    if (!newLocation.id || !newLocation.name) {
      alert("ID와 Location Name은 필수 입력 항목입니다.");
      return;
    }

    if (modalMode === "ADD") {
      // 중복 ID 체크
      if (locations.some((loc) => loc.id === newLocation.id)) {
        alert("이미 존재하는 Location ID입니다.");
        return;
      }
      const newItem = { ...newLocation, current: 0, status: "ACTIVE" };
      setLocations((prev) => [newItem, ...prev]);
    } else {
      // EDIT 모드: ID가 같은 항목을 찾아 업데이트
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === newLocation.id ? { ...loc, ...newLocation } : loc,
        ),
      );
    }
    setIsModalOpen(false);
  };

  // 3. Handlers: Input & UI
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = useCallback((type) => setFilterType(type), []);
  const handleSearchChange = useCallback(
    (e) => setSearchTerm(e.target.value),
    [],
  );

  // 4. Filtering Logic
  const filteredList = useMemo(() => {
    return locations.filter((loc) => {
      const matchType = filterType === "ALL" || loc.type === filterType;
      const matchSearch =
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [locations, filterType, searchTerm]);

  return (
    <Container>
      {/* Header Area */}
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
          <AddButton onClick={handleAdd}>
            <FaPlus /> Add Location
          </AddButton>
        </ActionGroup>
      </Header>

      {/* Search & Filter Bar */}
      <ControlBarSection
        filterType={filterType}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Grid Content */}
      <GridContainer>
        {filteredList.map((loc) => (
          <LocationCardItem
            key={loc.id}
            loc={loc}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </GridContainer>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>
                {modalMode === "ADD" ? "Add New Location" : "Edit Location"}
              </h3>
              <CloseBtn onClick={handleCloseModal}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Location ID</Label>
                <Input
                  name="id"
                  placeholder="e.g. WH-RAW-B"
                  value={newLocation.id}
                  onChange={handleInputChange}
                  readOnly={modalMode === "EDIT"} // 수정 시 ID 변경 불가
                  disabled={modalMode === "EDIT"}
                  style={{
                    backgroundColor: modalMode === "EDIT" ? "#f0f0f0" : "white",
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Location Name</Label>
                <Input
                  name="name"
                  placeholder="e.g. Raw Material Storage B"
                  value={newLocation.name}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <Row>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Type</Label>
                  <Select
                    name="type"
                    value={newLocation.type}
                    onChange={handleInputChange}
                  >
                    <option value="RAW">Raw Material</option>
                    <option value="WIP">WIP (Stocker)</option>
                    <option value="FG">Finished Goods</option>
                  </Select>
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={newLocation.capacity}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Row>
              <FormGroup>
                <Label>Condition</Label>
                <Input
                  name="condition"
                  placeholder="e.g. Dry Box (20°C)"
                  value={newLocation.condition}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={handleCloseModal}>Cancel</CancelButton>
              <SaveButton onClick={handleSaveLocation}>
                <FaSave /> {modalMode === "ADD" ? "Save" : "Update"}
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default LocationPage;

/* =========================================================================
   Styled Components
   ========================================================================= */

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

/* Header Styles */
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

/* Control Bar Styles */
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

/* Grid & Card Styles */
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
    props.$type === "RAW"
      ? "#e8f5e9"
      : props.$type === "WIP"
        ? "#fff3e0"
        : "#e3f2fd"};
  color: ${(props) =>
    props.$type === "RAW"
      ? "#2e7d32"
      : props.$type === "WIP"
        ? "#e67e22"
        : "#1976d2"};
`;
const LocId = styled.span`
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  padding: 0;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f9f9f9;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const Row = styled.div`
  display: flex;
  gap: 15px;
`;
const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #555;
`;
const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #1a4f8b;
  }
  &:disabled {
    color: #999;
  }
`;
const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: white;
  &:focus {
    border-color: #1a4f8b;
  }
`;
const SaveButton = styled.button`
  background: #1a4f8b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #133b6b;
  }
`;
const CancelButton = styled.button`
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;
