-- ==========================================
-- 1. 기초 데이터 (Member, Worker, Warehouse, Permission)
-- ==========================================

-- Member 등록
INSERT INTO member (id, name, email, password, authority, status) VALUES
(1, '이용현', 'dfgr567@naver.com',  '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_ADMIN', 'ACTIVE'),
(2, '이용현', 'dfgr56@naver.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(3, '김철수', 'kimcs@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(4, '이영희', 'leeyh@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(5, '박민수', 'parkms@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(6, '정지훈', 'jungjh@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(7, '최은지', 'choiej@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
(8, '한지민', 'hanjm@company.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE');

INSERT INTO worker (id, member_id, code, name, join_date, shift, status, dept, certifications) VALUES
(1, 2, 'W001', '이용현', '2026-02-04', 'Day',   'WORKING', 'PACK', 'Basic Safety'),
(2, 3, 'W002', '김철수', '2024-03-15', 'Day',   'WORKING', 'PACK', 'Basic Safety, ESD'),
(3, 4, 'W003', '이영희', '2023-11-01', 'Day',   'WORKING', 'PACK', 'Chemical Safety'),
(4, 5, 'W004', '박민수', '2022-06-20', 'Night', 'BREAK',   'CMP',  'Equipment Safety'),
(5, 6, 'W005', '정지훈', '2021-09-10', 'Swing', 'OFF',     'PACK', 'Basic Safety'),
(6, 7, 'W006', '최은지', '2020-04-05', 'Night', 'BREAK',   'PACK', 'Hazard Material'),
(7, 8, 'W007', '한지민', '2026-02-02', 'Swing', 'OFF',     'TBD',  'Basic Safety');

-- Warehouse 등록 (창고)
INSERT INTO warehouse
(code, name, type, address, status, capacity, occupancy)
VALUES
('WH-ALL-001','All Material Warehouse','Main','ALL-ZONE','AVAILABLE',30000,2350),
('WH-MAIN-001','Main Process Warehouse','Main','FAB-MAIN','AVAILABLE',20000,540),
('WH-SUB-001','Sub Material Warehouse','Sub','FAB-SUB','AVAILABLE',15000,750);


-- 권한 및 역할 (RBAC)
INSERT INTO permissions (code, name, group_name) VALUES ('USER_READ', '사용자 조회', '시스템 관리');
INSERT INTO permissions (code, name, group_name) VALUES ('USER_EDIT', '사용자 수정', '시스템 관리');
INSERT INTO roles (code, name, is_system) VALUES ('ROLE_ADMIN', '최고 관리자', true);
INSERT INTO roles (code, name, is_system) VALUES ('ROLE_OPERATOR', '생산 작업자', true);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 2);


-- ==========================================
-- 2. 마스터 데이터 (Product, Material, Equipment)
-- ==========================================

-- Product 등록 (ID 1~8 자동 생성됨)
INSERT INTO product (code, name, category) VALUES
('DRAM-4G-DDR4-001', 'DRAM 4Gb DDR4 칩', 'DRAM'),
('DRAM-8G-DDR4-002', 'DRAM 8Gb DDR4 칩', 'DRAM'),
('DRAM-16G-DDR5-003', 'DRAM 16Gb DDR5 칩', 'DRAM'),
('DRAM-32G-DDR5-004', 'DRAM 32Gb DDR5 칩', 'DRAM'),
('DRAM-4G-LP-005', 'Low-Power DRAM 4Gb', 'DRAM'),
('DRAM-8G-MB-006', 'Mobile DRAM 8Gb', 'DRAM'),
('DRAM-16G-GR-007', 'Graphics DRAM 16Gb', 'DRAM'),
('DRAM-4G-EM-008', 'Embedded DRAM 4Gb', 'DRAM');

-- Material 등록
INSERT INTO material (code, name, category, current_stock, safety_stock) VALUES
('MAT-SUBSTRATE', '패키지 기판', 'RAW_MATERIAL', 50, 30),
('MAT-SOLDERBALL', '솔더 볼', 'RAW_MATERIAL', 2000, 500),
('MAT-UNDERFILL', '언더필 수지', 'RAW_MATERIAL', 300, 500),
('MAT-MOLD', '몰딩 컴파운드', 'RAW_MATERIAL', 30, 400),
('MAT-HEATSINK', '히트싱크', 'SEMI_FINISHED', 10, 300),
('MAT-WIRE', '금 와이어', 'RAW_MATERIAL', 500, 600),
('MAT-LEADFRAME', '리드프레임', 'RAW_MATERIAL', 400, 500),
('MAT-ENCAPSULANT', '에폭시 봉지재', 'RAW_MATERIAL', 250, 300),
('MAT-WAFER', 'DRAM 웨이퍼', 'RAW_MATERIAL', 100, 100),
('8801234567891', '웨이퍼 기판', 'RAW_MATERIAL', 500, 1000);

-- Equipment 등록 (★ ID=1 강제 지정 ★)
INSERT INTO equipment (id, code, name, type, location, status, install_date) VALUES
(1, 'LINE-01-M01', '종합 패키징 설비', 'Total', '창고2', 'RUN','2026-02-11');


-- MaterialTransaction 등록 (초기 입고 기록)
INSERT INTO material_transaction
(tx_type, material_id, qty, unit, target_location, target_equipment, worker_name, created_at)
VALUES
('INBOUND', (SELECT id FROM material WHERE code='MAT-SUBSTRATE'), 50, 'ea', 'WH-ALL-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-SOLDERBALL'), 2000, 'ea', 'WH-ALL-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-UNDERFILL'), 300, 'kg', 'WH-ALL-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-MOLD'), 30, 'kg', 'WH-MAIN-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-HEATSINK'), 10, 'ea', 'WH-MAIN-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-WIRE'), 500, 'm', 'WH-MAIN-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-LEADFRAME'), 400, 'ea', 'WH-SUB-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-ENCAPSULANT'), 250, 'kg', 'WH-SUB-001', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-WAFER'), 100, 'ea', 'WH-SUB-001', NULL, 'SYSTEM', NOW());


-- BOM 등록
-- BOM Header (제품별 BOM 정의)
INSERT INTO bom (product_id, revision, status) VALUES
(1, 1, 'ACTIVE'), (2, 1, 'ACTIVE'), (3, 1, 'ACTIVE'), (4, 1, 'ACTIVE'),
(5, 1, 'ACTIVE'), (6, 1, 'ACTIVE'), (7, 1, 'ACTIVE'), (8, 1, 'ACTIVE');

-- BOM Line
INSERT INTO bom_item (bom_id, material_id, required_qty) VALUES
(1, 1, 1), (1, 2, 200), (1, 3, 1), (1, 4, 1), (1, 6, 50), (1, 7, 1), (1, 8, 1),
(2, 1, 1), (2, 2, 250), (2, 3, 1), (2, 4, 1), (2, 6, 60), (2, 7, 1), (2, 8, 1),
(3, 1, 1), (3, 2, 300), (3, 3, 1), (3, 4, 1), (3, 6, 70), (3, 7, 1), (3, 8, 1),
(4, 1, 1), (4, 2, 400), (4, 3, 1), (4, 4, 1), (4, 6, 80), (4, 7, 1), (4, 8, 1), (4, 5, 1),
(5, 1, 1), (5, 2, 180), (5, 3, 1), (5, 4, 1), (5, 6, 40), (5, 7, 1), (5, 8, 1),
(6, 1, 1), (6, 2, 220), (6, 3, 1), (6, 4, 1), (6, 6, 55), (6, 7, 1), (6, 8, 1),
(7, 1, 1), (7, 2, 350), (7, 3, 1), (7, 4, 1), (7, 6, 75), (7, 7, 1), (7, 8, 1), (7, 5, 1),
(8, 1, 1), (8, 2, 200), (8, 3, 1), (8, 4, 1), (8, 6, 45), (8, 7, 1), (8, 8, 1);

-- Lot 등록
INSERT INTO lot (code, material_id, location, status) VALUES
('LOT-20260122-01', 9, '웨이퍼창고', '대기'),
('LOT-20260122-02', 1, '클린룸', '공정중'),
('LOT-20260122-03', 3, '창고', '대기'),
('LOT-20260122-04', 6, '클린룸', '공정중'),
('LOT-20260122-05', 7, '창고', '대기'),
('LOT-20260122-06', 2, '클린룸', '공정중'),
('LOT-20260122-07', 4, '클린룸', '공정중'),
('LOT-20260122-08', 8, '클린룸', '공정중');


-- ==========================================
-- 4. 생산 운영 데이터 (WorkOrder -> ProductionLog)
-- ==========================================

-- 작업지시 등록 (★ ID=1 강제 지정 ★)
INSERT INTO work_order (
  id, work_order_number, product_id, target_qty, current_qty, status, assigned_machine_id, target_line
) VALUES (
  1, 'WO-20260120-1001', 1, 1200, 1150, 'IN_PROGRESS', 'MACHINE-01', 'Fab-Line-A'
);

-- 생산로그 등록 (WorkOrder ID=1, Equipment ID=1 필요)
INSERT INTO production_log (
  id, work_order_id, equipment_id, process_step, lot_no,
  result_qty, defect_qty, status, result_date, start_time, end_time,
  level, category, message
) VALUES
(1, 1, 1, 'PHOTO', 'LOT-0601', 220, 3, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 4 HOUR, CURRENT_DATE + INTERVAL 6 HOUR + INTERVAL 5 MINUTE, 'INFO', 'PRODUCTION', '06시 PHOTO 공정 완료'),
(2, 1, 1, 'PHOTO', 'LOT-0801', 260, 4, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 6 HOUR, CURRENT_DATE + INTERVAL 8 HOUR + INTERVAL 10 MINUTE, 'INFO', 'PRODUCTION', '08시 PHOTO 공정 완료'),
(3, 1, 1, 'PHOTO', 'LOT-0802', 240, 2, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 6 HOUR + INTERVAL 20 MINUTE, CURRENT_DATE + INTERVAL 8 HOUR + INTERVAL 40 MINUTE, 'WARN', 'PRODUCTION', '08시 자재 지연'),
(4, 1, 1, 'ETCH', 'LOT-1001', 300, 5, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 8 HOUR, CURRENT_DATE + INTERVAL 10 HOUR + INTERVAL 15 MINUTE, 'INFO', 'PRODUCTION', '10시 ETCH 공정 완료'),
(5, 1, 1, 'ETCH', 'LOT-1201', 320, 6, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 10 HOUR, CURRENT_DATE + INTERVAL 12 HOUR + INTERVAL 20 MINUTE, 'WARN', 'PRODUCTION', '12시 불량 일부 발생'),
(6, 1, 1, 'ETCH', 'LOT-1202', 310, 4, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 10 HOUR + INTERVAL 30 MINUTE, CURRENT_DATE + INTERVAL 12 HOUR + INTERVAL 45 MINUTE, 'INFO', 'PRODUCTION', '12시 ETCH 추가 LOT'),
(7, 1, 1, 'CMP', 'LOT-1401', 350, 5, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 12 HOUR, CURRENT_DATE + INTERVAL 14 HOUR + INTERVAL 5 MINUTE, 'INFO', 'PRODUCTION', '14시 CMP 공정 완료'),
(8, 1, 1, 'CMP', 'LOT-1601', 370, 6, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 14 HOUR, CURRENT_DATE + INTERVAL 16 HOUR + INTERVAL 10 MINUTE, 'WARN', 'PRODUCTION', '16시 CMP 진동 감지'),
(9, 1, 1, 'PHOTO', 'LOT-1801', 400, 7, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 16 HOUR, CURRENT_DATE + INTERVAL 18 HOUR + INTERVAL 15 MINUTE, 'INFO', 'PRODUCTION', '18시 PHOTO 공정 완료'),
(10, 1, 1, 'PHOTO', 'LOT-1802', 390, 6, 'DONE', CURRENT_DATE, CURRENT_DATE + INTERVAL 16 HOUR + INTERVAL 20 MINUTE, CURRENT_DATE + INTERVAL 18 HOUR + INTERVAL 40 MINUTE, 'INFO', 'PRODUCTION', '18시 추가 생산 완료');


-- ==========================================
-- 5. 생산 결과 데이터
-- ==========================================

-- Production_result 등록
INSERT INTO production_result (defect_qty, good_qty, plan_qty, result_date, result_hour, created_at, product_id, line) VALUES
(1, 480, 500, '2026-02-02', 8,  '2026-01-20 08:05:00', 1, 'Fab-Line-A'),
(0, 550, 550, '2026-02-03', 9,  '2026-01-20 09:05:00', 1, 'Fab-Line-A'),
(2, 580, 600, '2026-02-04', 10, '2026-01-20 10:05:00', 1, 'Fab-Line-A'),
(0, 620, 600, '2026-02-05', 11, '2026-01-20 11:05:00', 1, 'Fab-Line-A'),
(5, 470, 480, '2026-02-02', 12, '2026-01-20 12:05:00', 3, 'EDS-Line-01'),
(8, 485, 490, '2026-02-03', 13, '2026-01-20 13:05:00', 3, 'EDS-Line-01'),
(12, 460, 480, '2026-02-04', 14, '2026-01-20 14:05:00', 3, 'EDS-Line-01'),
(0, 180, 180, '2026-02-02', 15, '2026-01-20 15:05:00', 5, 'Mod-Line-C'),
(1, 195, 200, '2026-02-03', 16, '2026-01-20 16:05:00', 5, 'Mod-Line-C'),
(0, 210, 210, '2026-02-04', 17, '2026-01-20 17:05:00', 5, 'Mod-Line-C');