package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.MaterialTxType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "material_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tx_type", nullable = false, length = 20)
    private MaterialTxType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "qty", nullable = false)
    private Integer qty;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "target_location", length = 50)
    private String targetLocation;

    @Column(name = "target_equipment", length = 50)
    private String targetEquipment;

    @Column(name = "worker_name", length = 50)
    private String workerName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
