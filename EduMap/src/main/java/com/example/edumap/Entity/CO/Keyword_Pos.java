package com.example.edumap.Entity.CO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "keyword")
public class Keyword_Pos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String po;
    private String reason;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "keyword_id")
    private Keywords keyword;
}