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

/* =====================
   기본값
===================== */
const defaultWarehouse = {
  code: "",
  name: "",
  type: "Main",
  address: "",
  capacity: 1,
  param: "",
};

/* =====================
   Control Bar
===================== */
const ControlBarSection = React.memo(
  ({ filterType, onFilterChange, searchTerm, onSearchChange }) => (
    <ControlBar>
      <FilterGroup>
        {["ALL", "Main", "Sub", "ColdStorage", "CleanRoom"].map((type) => (
          <FilterBtn
            key={type}
            $active={filterType === type}
            onClick={() => onFilterChange(type)}
          >
            {type}
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
  ),
);

/* =====================
   Location Card
===================== */
const LocationCardItem = React.memo(({ loc, onDelete, onEdit }) => {
  const occupancy = loc.occupancy ?? 0;
  const capacity = loc.capacity ?? 1;
  const percent = Math.round((occupancy / capacity) * 100);
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
          {loc.type?.includes("Cold") ? (
            <FaThermometerHalf color="#3498db" />
          ) : loc.type?.includes("Dry") ? (
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
              {percent}% ({occupancy}/{capacity})
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

/* =====================
   CRUD Modal
===================== */
const CrudModal = ({ isEdit, formData, onChange, onSubmit, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalHeader>
        <ModalTitle>
          <FaTools /> {isEdit ? "Edit Warehouse" : "Add Warehouse"}
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
          {["code", "name", "address"].map((key) => (
            <FormItem key={key}>
              <FormLabel>{key.toUpperCase()}</FormLabel>
              <FormInput name={key} value={formData[key]} onChange={onChange} />
            </FormItem>
          ))}

          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormSelect name="type" value={formData.type} onChange={onChange}>
              <option value="Main">Main</option>
              <option value="Sub">Sub</option>
              <option value="ColdStorage">ColdStorage</option>
              <option value="CleanRoom">CleanRoom</option>
            </FormSelect>
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
        </FormGrid>
      </ModalBody>

      <ModalFooter>
        <ModalBtn className="close" onClick={onSubmit}>
          {isEdit ? "Save" : "Add"}
        </ModalBtn>
      </ModalFooter>
    </ModalBox>
  </ModalOverlay>
);

/* =====================
   Main Page
===================== */
const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(defaultWarehouse);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await axiosInstance.get("/api/mes/master/warehouse/list");
    setLocations(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const safePayload = (data) => {
    const { occupancy, status, ...rest } = data;
    return rest;
  };

  const handleSubmit = async () => {
    const payload = safePayload(formData);

    if (editing) {
      await axiosInstance.put(
        `/api/mes/master/warehouse/${formData.id}`,
        payload,
      );
    } else {
      await axiosInstance.post("/api/mes/master/warehouse", payload);
    }

    setModalOpen(false);
    fetchData();
  };

  const filteredList = useMemo(() => {
    return locations.filter(
      (w) =>
        (filterType === "ALL" || w.type === filterType) &&
        (w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [locations, filterType, searchTerm]);

  return (
    <Container>
      <Header>
        <PageTitle>
          <FaWarehouse /> Warehouse Location Master
          {loading && <FaSync className="spin" />}
        </PageTitle>
        <AddButton
          onClick={() => {
            setFormData(defaultWarehouse);
            setEditing(false);
            setModalOpen(true);
          }}
        >
          <FaPlus /> Add Location
        </AddButton>
      </Header>

      <ControlBarSection
        filterType={filterType}
        onFilterChange={setFilterType}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />

      <GridContainer>
        {filteredList.map((loc) => (
          <LocationCardItem
            key={loc.id}
            loc={loc}
            onDelete={async (id) => {
              await axiosInstance.delete(`/api/mes/master/warehouse/${id}`);
              fetchData();
            }}
            onEdit={(loc) => {
              setFormData(loc);
              setEditing(true);
              setModalOpen(true);
            }}
          />
        ))}
      </GridContainer>

      {modalOpen && (
        <CrudModal
          isEdit={editing}
          formData={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
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
