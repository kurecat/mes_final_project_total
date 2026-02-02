-- Member 등록
INSERT INTO member (name, email, password, authority, status) VALUES
('이용현', 'dfgr56@naver.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
('이용현', 'dfgr567@naver.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_ADMIN', 'ACTIVE');

-- Product 등록
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

/*
  본사 워크센터(천안시 동남구 물류센터)에 집중된 창고 데이터 예시
  - 창고 유형: All, Main, Sub, ColdStorage, CleanRoom
*/
INSERT INTO Warehouse (code, name, type, address, capacity, occupancy, status)
VALUES
('WH-ALL-001', '전체 창고', 'All', '천안시 동남구 본사 물류센터', 10000, 0, 'AVAILABLE'),
('WH-MAIN-001', '메인 창고', 'Main', '천안시 동남구 본사 물류센터', 8000, 0, 'AVAILABLE'),
('WH-SUB-001', '서브 창고', 'Sub', '천안시 동남구 본사 물류센터', 5000, 0, 'AVAILABLE'),
('WH-COLD-001', '냉동 창고', 'ColdStorage', '천안시 동남구 본사 물류센터', 3000, 0, 'AVAILABLE'),
('WH-CLEAN-001', '클린룸 창고', 'CleanRoom', '천안시 동남구 본사 물류센터', 2000, 0, 'AVAILABLE');


-- MaterialTransaction 등록 (초기 입고 기록)
INSERT INTO material_transaction
(tx_type, material_id, qty, unit, target_location, target_equipment, worker_name, created_at)
VALUES
('INBOUND', (SELECT id FROM material WHERE code='MAT-SUBSTRATE'), 50, 'ea', 'WH-A-01', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-SOLDERBALL'), 2000, 'ea', 'WH-A-01', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-UNDERFILL'), 300, 'kg', 'WH-C-12', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-MOLD'), 30, 'kg', 'WH-C-12', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-HEATSINK'), 10, 'ea', 'WH-B-05', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-WIRE'), 500, 'm', 'WH-B-05', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-LEADFRAME'), 400, 'ea', 'WH-A-02', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-ENCAPSULANT'), 250, 'kg', 'WH-C-12', NULL, 'SYSTEM', NOW()),
('INBOUND', (SELECT id FROM material WHERE code='MAT-WAFER'), 100, 'ea', 'WH-A-01', NULL, 'SYSTEM', NOW());


-- BOM 등록
-- BOM Header (제품별 BOM 정의)
INSERT INTO bom (product_id, revision, status) VALUES
(1, 1, 'ACTIVE'),
(2, 1, 'ACTIVE'),
(3, 1, 'ACTIVE'),
(4, 1, 'ACTIVE'),
(5, 1, 'ACTIVE'),
(6, 1, 'ACTIVE'),
(7, 1, 'ACTIVE'),
(8, 1, 'ACTIVE');

-- BOM Line (자재별 소요량 정의)
INSERT INTO bom_item (bom_id, material_id, required_qty) VALUES
-- Product 1 BOM
(1, 1, 1),
(1, 2, 200),
(1, 3, 1),
(1, 4, 1),
(1, 6, 50),
(1, 7, 1),
(1, 8, 1),

-- Product 2 BOM
(2, 1, 1),
(2, 2, 250),
(2, 3, 1),
(2, 4, 1),
(2, 6, 60),
(2, 7, 1),
(2, 8, 1),

-- Product 3 BOM
(3, 1, 1),
(3, 2, 300),
(3, 3, 1),
(3, 4, 1),
(3, 6, 70),
(3, 7, 1),
(3, 8, 1),

-- Product 4 BOM
(4, 1, 1),
(4, 2, 400),
(4, 3, 1),
(4, 4, 1),
(4, 6, 80),
(4, 7, 1),
(4, 8, 1),
(4, 5, 1),

-- Product 5 BOM
(5, 1, 1),
(5, 2, 180),
(5, 3, 1),
(5, 4, 1),
(5, 6, 40),
(5, 7, 1),
(5, 8, 1),

-- Product 6 BOM
(6, 1, 1),
(6, 2, 220),
(6, 3, 1),
(6, 4, 1),
(6, 6, 55),
(6, 7, 1),
(6, 8, 1),

-- Product 7 BOM
(7, 1, 1),
(7, 2, 350),
(7, 3, 1),
(7, 4, 1),
(7, 6, 75),
(7, 7, 1),
(7, 8, 1),
(7, 5, 1),

-- Product 8 BOM
(8, 1, 1),
(8, 2, 200),
(8, 3, 1),
(8, 4, 1),
(8, 6, 45),
(8, 7, 1),
(8, 8, 1);


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

-- Equipment 등록
INSERT INTO equipment (code, name, type, location, status,install_date) VALUES
('LINE-01-M01', '종합 패키징 설비', 'Total', '창고2', 'RUN','2026-02-11');

-- 작업지시 등록
INSERT INTO work_order
(
  work_order_number,
  product_id,
  target_qty,
  current_qty,
  status,
  assigned_machine_id,
  target_line
)
VALUES
('WO-20260120-1001', 1, 1200, 1150, 'IN_PROGRESS', 'MACHINE-01', 'Fab-Line-A');

-- 생산로그 등록
INSERT INTO production_log (
  id, work_order_id, equipment_id, process_step, lot_no,
  result_qty, defect_qty, status, result_date, start_time, end_time,
  level, category, message
) VALUES
-- 06시대 완료
(1, 1, 1, 'PHOTO', 'LOT-0601', 220, 3, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 4 HOUR, CURRENT_DATE + INTERVAL 6 HOUR + INTERVAL 5 MINUTE,
 'INFO', 'PRODUCTION', '06시 PHOTO 공정 완료'),

-- 08시대 완료
(2, 1, 1, 'PHOTO', 'LOT-0801', 260, 4, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 6 HOUR, CURRENT_DATE + INTERVAL 8 HOUR + INTERVAL 10 MINUTE,
 'INFO', 'PRODUCTION', '08시 PHOTO 공정 완료'),

(3, 1, 1, 'PHOTO', 'LOT-0802', 240, 2, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 6 HOUR + INTERVAL 20 MINUTE, CURRENT_DATE + INTERVAL 8 HOUR + INTERVAL 40 MINUTE,
 'WARN', 'PRODUCTION', '08시 자재 지연'),

-- 10시대 완료
(4, 1, 1, 'ETCH', 'LOT-1001', 300, 5, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 8 HOUR, CURRENT_DATE + INTERVAL 10 HOUR + INTERVAL 15 MINUTE,
 'INFO', 'PRODUCTION', '10시 ETCH 공정 완료'),

-- 12시대 완료
(5, 1, 1, 'ETCH', 'LOT-1201', 320, 6, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 10 HOUR, CURRENT_DATE + INTERVAL 12 HOUR + INTERVAL 20 MINUTE,
 'WARN', 'PRODUCTION', '12시 불량 일부 발생'),

(6, 1, 1, 'ETCH', 'LOT-1202', 310, 4, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 10 HOUR + INTERVAL 30 MINUTE, CURRENT_DATE + INTERVAL 12 HOUR + INTERVAL 45 MINUTE,
 'INFO', 'PRODUCTION', '12시 ETCH 추가 LOT'),

-- 14시대 완료
(7, 1, 1, 'CMP', 'LOT-1401', 350, 5, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 12 HOUR, CURRENT_DATE + INTERVAL 14 HOUR + INTERVAL 5 MINUTE,
 'INFO', 'PRODUCTION', '14시 CMP 공정 완료'),

-- 16시대 완료
(8, 1, 1, 'CMP', 'LOT-1601', 370, 6, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 14 HOUR, CURRENT_DATE + INTERVAL 16 HOUR + INTERVAL 10 MINUTE,
 'WARN', 'PRODUCTION', '16시 CMP 진동 감지'),

-- 18시대 완료
(9, 1, 1, 'PHOTO', 'LOT-1801', 400, 7, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 16 HOUR, CURRENT_DATE + INTERVAL 18 HOUR + INTERVAL 15 MINUTE,
 'INFO', 'PRODUCTION', '18시 PHOTO 공정 완료'),

(10, 1, 1, 'PHOTO', 'LOT-1802', 390, 6, 'DONE',
 CURRENT_DATE, CURRENT_DATE + INTERVAL 16 HOUR + INTERVAL 20 MINUTE, CURRENT_DATE + INTERVAL 18 HOUR + INTERVAL 40 MINUTE,
 'INFO', 'PRODUCTION', '18시 추가 생산 완료');



-- Production_result 등록
INSERT INTO production_result
(defect_qty, good_qty, plan_qty, result_date, result_hour, created_at, product_id, line)
VALUES
-- Fab (product_id=1 : DDR5 1znm Wafer)
(1, 48, 50, '2026-02-02', 8,  '2026-01-20 08:05:00', 1, 'Fab-Line-A'),
(0, 55, 55, '2026-02-03', 9,  '2026-01-20 09:05:00', 1, 'Fab-Line-A'),
(2, 58, 60, '2026-02-04', 10, '2026-01-20 10:05:00', 1, 'Fab-Line-A'),
(0, 62, 60, '2026-02-05', 11, '2026-01-20 11:05:00', 1, 'Fab-Line-A'),

-- EDS (product_id=3 : 16Gb DDR5 SDRAM)
(5, 4700, 4800, '2026-02-02', 12, '2026-01-20 12:05:00', 3, 'EDS-Line-01'),
(8, 4850, 4900, '2026-02-03', 13, '2026-01-20 13:05:00', 3, 'EDS-Line-01'),
(12, 4600, 4800, '2026-02-04', 14, '2026-01-20 14:05:00', 3, 'EDS-Line-01'),

-- Module (product_id=5 : DDR5 32GB UDIMM)
(0, 180, 180, '2026-02-02', 15, '2026-01-20 15:05:00', 5, 'Mod-Line-C'),
(1, 195, 200, '2026-02-03', 16, '2026-01-20 16:05:00', 5, 'Mod-Line-C'),
(0, 210, 210, '2026-02-04', 17, '2026-01-20 17:05:00', 5, 'Mod-Line-C');

-- 작업자 추가
INSERT INTO worker (
  id, name, join_date, shift, status, dept, certifications
) VALUES
(1, '김철수', '2024-03-15', 'Day',   'WORKING', 'PHOTO', 'Basic Safety, ESD'),

(2, '이영희', '2023-11-01', 'Day',   'WORKING', 'ETCH',  'Chemical Safety'),

(3, '박민수', '2022-06-20', 'Night', 'BREAK',   'CMP',   'Equipment Safety'),

(4, '정지훈', '2021-09-10', 'Swing', 'OFF',     'PHOTO', 'Basic Safety'),

(5, '최은지', '2020-04-05', 'Night', 'BREAK',   'ETCH',  'Hazard Material'),

(6, '한지민', '2026-02-02', 'Swing', 'OFF',     'TBD',   'Basic Safety');

