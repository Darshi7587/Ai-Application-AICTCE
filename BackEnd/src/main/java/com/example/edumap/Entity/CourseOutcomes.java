package com.example.edumap.Entity;
import com.example.edumap.Entity.Enum.ProgramOutcome_Constants;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Getter
@Setter
public class CourseOutcomes
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "courseCode")
    @JsonBackReference
    private Course course;

    private String description;

    @ElementCollection
    @CollectionTable(
            name = "course_outcome_program_outcomes",
            joinColumns = @JoinColumn(name = "course_outcome")
    )
    private List<ProgramOutcomes> outcomes =
            new LinkedList<>();

}
