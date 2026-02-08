package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BomRepository extends JpaRepository<Bom, Long> {
   List<Bom> findAllByOrderByProductIdAscRevisionDesc();
   Optional<Bom> findByProduct_CodeAndRevision(String code, int revision);

}
