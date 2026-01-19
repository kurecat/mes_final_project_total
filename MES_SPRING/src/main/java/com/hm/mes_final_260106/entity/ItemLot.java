package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_lot")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", nullable = false)
    private Lot lot;
}

