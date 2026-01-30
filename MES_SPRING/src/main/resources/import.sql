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
INSERT INTO material (code, name, current_stock, safety_stock) VALUES
('MAT-SUBSTRATE', '패키지 기판', 50,30),
('MAT-SOLDERBALL', '솔더 볼', 2000,500),
('MAT-UNDERFILL', '언더필 수지', 300,500),
('MAT-MOLD', '몰딩 컴파운드', 30,400),
('MAT-HEATSINK', '히트싱크', 10,300),
('MAT-WIRE', '금 와이어', 500,600),
('MAT-LEADFRAME', '리드프레임', 400,500),
('MAT-ENCAPSULANT', '에폭시 봉지재', 250,300),
('MAT-WAFER', 'DRAM 웨이퍼', 100,100),
('8801234567891', '웨이퍼 기판', 500, 1000);

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
INSERT INTO equipment (code, name, type, location, status) VALUES
('LINE-01-M01', '종합 패키징 설비', 'Total', '창고2', 'RUN');

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
  id, work_order_id, equipment_id, member_id, process_step, lot_no,
  result_qty, defect_qty, status, result_date, start_time, end_time,
  level, category, message
) VALUES
(1, 1, 1, 1, 'PHOTO', 'LOT-001', 380, 5, 'DONE', '2026-01-30', '2026-01-30 15:21:35', '2026-01-30 15:55:00', 'INFO', 'PRODUCTION', '작업자 교대 완료'),
(2, 1, 1, 1, 'PHOTO', 'LOT-002', 440, 3, 'DONE', '2026-01-30', '2026-01-30 15:21:35', '2026-01-30 15:50:00', 'WARN', 'PRODUCTION', '자재 부족 발생'),
(3, 1, 1, 1, 'ETCH',  'LOT-003', 510, 8, 'DONE', '2026-01-30', '2026-01-30 15:21:35', '2026-01-30 16:48:00', 'INFO', 'PRODUCTION', 'LOT A2301 생산 시작'),
(4, 1, 1, 1, 'ETCH',  'LOT-004', 200, 2, 'DONE', '2026-01-30', '2026-01-30 15:21:35', '2026-01-30 17:40:00', 'WARN', 'PRODUCTION', '불량률 증가 감지'),
(5, 1, 1, 1, 'CMP',   'LOT-005', 480, 4, 'DONE', '2026-01-30', '2026-01-30 15:21:35', '2026-01-30 18:51:00', 'INFO', 'PRODUCTION', '금일 목표 달성');


-- Production_result 등록
INSERT INTO production_result
(defect_qty, good_qty, plan_qty, result_date, result_hour, created_at, product_id, line)
VALUES
-- Fab (product_id=1 : DDR5 1znm Wafer)
(1, 48, 50, '2026-01-28', 8,  '2026-01-20 08:05:00', 1, 'Fab-Line-A'),
(0, 55, 55, '2026-01-28', 9,  '2026-01-20 09:05:00', 1, 'Fab-Line-A'),
(2, 58, 60, '2026-01-29', 10, '2026-01-20 10:05:00', 1, 'Fab-Line-A'),
(0, 62, 60, '2026-01-30', 11, '2026-01-20 11:05:00', 1, 'Fab-Line-A'),

-- EDS (product_id=3 : 16Gb DDR5 SDRAM)
(5, 4700, 4800, '2026-01-28', 12, '2026-01-20 12:05:00', 3, 'EDS-Line-01'),
(8, 4850, 4900, '2026-01-29', 13, '2026-01-20 13:05:00', 3, 'EDS-Line-01'),
(12, 4600, 4800, '2026-01-30', 14, '2026-01-20 14:05:00', 3, 'EDS-Line-01'),

-- Module (product_id=5 : DDR5 32GB UDIMM)
(0, 180, 180, '2026-01-28', 15, '2026-01-20 15:05:00', 5, 'Mod-Line-C'),
(1, 195, 200, '2026-01-29', 16, '2026-01-20 16:05:00', 5, 'Mod-Line-C'),
(0, 210, 210, '2026-01-30', 17, '2026-01-20 17:05:00', 5, 'Mod-Line-C');

