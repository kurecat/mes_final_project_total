package com.hm.mes_final_260106.constant;

public enum EquipmentStatus {
    IDLE,
    RUN,
    DOWN;


    // 🔥 여기 붙인다
    public static EquipmentStatus from(String value) {
        try {
            return EquipmentStatus.valueOf(value);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Invalid EquipmentStatus: " + value
            );
        }
    }
}
