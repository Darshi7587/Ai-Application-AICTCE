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
@ToString(exclude = {"course", "keywords"})
public class CourseOutcomes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String CO;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "course_code")
    private Course course;

    @OneToMany(mappedBy = "courseOutcomes", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Keywords> keywords = new ArrayList<>();
}