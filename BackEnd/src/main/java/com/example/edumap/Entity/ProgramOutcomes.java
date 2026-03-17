package com.example.edumap.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Embeddable
public class ProgramOutcomes {

    private int POsId;
    private Integer score;
    @Lob
    private String description;

}
