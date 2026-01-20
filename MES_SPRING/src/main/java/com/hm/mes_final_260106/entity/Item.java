package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_item_serial_number", columnNames = "serial_number")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workorder_id")
    private WorkOrder workOrder;

    @Column(name = "inspection_result", length = 50)
    private String inspectionResult;

    @Column(length = 100)
    private String location;
}

