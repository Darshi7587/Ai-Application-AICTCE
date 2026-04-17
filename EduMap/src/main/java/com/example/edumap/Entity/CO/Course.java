package com.example.edumap.Entity.CO;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;



@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "courseOutcomesList")
public class Course {

    @Id
    private String courseCode;

    private String courseName;
    private String courseDescription;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseOutcomes> courseOutcomesList = new ArrayList<>();
}