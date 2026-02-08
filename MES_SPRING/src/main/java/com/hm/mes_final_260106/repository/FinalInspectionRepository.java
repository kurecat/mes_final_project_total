package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.FinalInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FinalInspectionRepository extends JpaRepository<FinalInspection, Long> {

    @Query("""
        SELECT fi.id, fi.productionLog.id, fi.item.id, 'electrical'
        FROM FinalInspection fi
        WHERE fi.electrical = 'FAIL'
        UNION
        SELECT fi.id, fi.productionLog.id, fi.item.id, 'reliability'
        FROM FinalInspection fi
        WHERE fi.reliability = 'FAIL'
        UNION
        SELECT fi.id, fi.productionLog.id, fi.item.id, 'visual'
        FROM FinalInspection fi
        WHERE fi.visual = 'FAIL'
        """)
    List<Object[]> findFailErrorsRaw();
}