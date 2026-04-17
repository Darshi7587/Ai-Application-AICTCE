package com.example.edumap.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class CoMappingEntity {

    // ✅ PRIMARY KEY (THIS WAS MISSING)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String co;

    private String keyword;

    private String po;

    private String reason;
}