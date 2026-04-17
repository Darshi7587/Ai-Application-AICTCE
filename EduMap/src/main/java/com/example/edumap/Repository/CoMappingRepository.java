package com.example.edumap.Repository;

import com.example.edumap.Entity.CoMappingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoMappingRepository
        extends JpaRepository<CoMappingEntity, Long> {
}