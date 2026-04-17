package com.example.edumap.Entity.CO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"courseOutcomes", "reasons"})
public class Keywords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyword;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "co_id")
    private CourseOutcomes courseOutcomes;

    @OneToMany(mappedBy = "keyword", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Keyword_Pos> reasons = new ArrayList<>();
}