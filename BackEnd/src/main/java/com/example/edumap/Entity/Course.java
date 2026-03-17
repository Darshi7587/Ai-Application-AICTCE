package com.example.edumap.Entity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Data
@Getter
@Setter
public class Course {

    @Id
    private String courseCode;

    private String courseName;

    private String courseDescription;

    @OneToMany(mappedBy = "course",cascade = CascadeType.ALL)
    @JsonManagedReference
    List<CourseOutcomes> COes = new ArrayList<>();

}
