package com.example.edumap.Entity.CO;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.*;

@Getter
@Setter
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Keyword_Pos {
    @Id
    private Long id;
    String Po;
    String reason;

    @ManyToOne
    private Keywords keyword;
}
