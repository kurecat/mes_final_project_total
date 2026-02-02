package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BomRepository extends JpaRepository<Bom, Long> {
    @Query("""
        SELECT b
        FROM Bom b
        WHERE b.revision = (
            SELECT MAX(b2.revision)
            FROM Bom b2
            WHERE b2.product.id = b.product.id
        )
        ORDER BY b.product.id ASC
    """)
    List<Bom> findLatestBomForAllProductsOrderByProductId();

}
