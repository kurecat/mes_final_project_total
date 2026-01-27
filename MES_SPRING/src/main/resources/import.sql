-- Member 등록
INSERT INTO member (name, email, password, authority, status) VALUES
('이용현', 'dfgr56@naver.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_OPERATOR', 'ACTIVE'),
('이용현', 'dfgr567@naver.com', '$2a$10$z5fqAUASGYYwOxJgnodXPOiHNgbTaVLV39hlh0WE0Z3ai6/rDCdha', 'ROLE_ADMIN', 'ACTIVE');

-- Product 등록
INSERT INTO product (code, name) VALUES
('DRAM-4G-DDR4-001', 'DRAM 4Gb DDR4 칩'),
('DRAM-8G-DDR4-002', 'DRAM 8Gb DDR4 칩'),
('DRAM-16G-DDR5-003', 'DRAM 16Gb DDR5 칩'),
('DRAM-32G-DDR5-004', 'DRAM 32Gb DDR5 칩'),
('DRAM-4G-LP-005', 'Low-Power DRAM 4Gb'),
('DRAM-8G-MB-006', 'Mobile DRAM 8Gb'),
('DRAM-16G-GR-007', 'Graphics DRAM 16Gb'),
('DRAM-4G-EM-008', 'Embedded DRAM 4Gb');

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
('MAT-WAFER', 'DRAM 웨이퍼', 100,100);

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
INSERT INTO bom (product_id, material_id, required_qty) VALUES
(1, 1, 1),
(1, 2, 200),
(1, 3, 1),
(1, 4, 1),
(1, 6, 50),
(1, 7, 1),
(1, 8, 1),
(2, 1, 1),
(2, 2, 250),
(2, 3, 1),
(2, 4, 1),
(2, 6, 60),
(2, 7, 1),
(2, 8, 1),
(3, 1, 1),
(3, 2, 300),
(3, 3, 1),
(3, 4, 1),
(3, 6, 70),
(3, 7, 1),
(3, 8, 1),
(4, 1, 1),
(4, 2, 400),
(4, 3, 1),
(4, 4, 1),
(4, 6, 80),
(4, 7, 1),
(4, 8, 1),
(4, 5, 1),
(5, 1, 1),
(5, 2, 180),
(5, 3, 1),
(5, 4, 1),
(5, 6, 40),
(5, 7, 1),
(5, 8, 1),
(6, 1, 1),
(6, 2, 220),
(6, 3, 1),
(6, 4, 1),
(6, 6, 55),
(6, 7, 1),
(6, 8, 1),
(7, 1, 1),
(7, 2, 350),
(7, 3, 1),
(7, 4, 1),
(7, 6, 75),
(7, 7, 1),
(7, 8, 1),
(7, 5, 1),
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
('LINE-01-M01', '종합 패키징 설비', 'Total', '창고2', '정상');