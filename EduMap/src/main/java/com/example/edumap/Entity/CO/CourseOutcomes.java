package com.example.edumap.Entity.CO;

import com.example.edumap.Entity.Course;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Getter
@Setter
public class CourseOutcomes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Course course;
    private String CO;
    @OneToMany(cascade = CascadeType.ALL)
    private List<Keywords> keywords = new ArrayList<>();

}
