package com.example.edumap.Entity;
import com.example.edumap.Entity.CO.CourseOutcomes;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;



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

    @OneToMany
    private List<CourseOutcomes> courseOutcomesList=new ArrayList<>();

}
