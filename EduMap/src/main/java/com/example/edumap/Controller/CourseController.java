package com.example.edumap.Controller;

import com.example.edumap.DTOs.AddCORequest;
import com.example.edumap.Entity.Course;
import com.example.edumap.Repository.CourseRepo;
import com.example.edumap.Service.CourseService;
import com.example.edumap.Service.ProgramServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
public class CourseController {

    @Autowired
    private CourseService courseService;
    @Autowired
    ProgramServices programServices;
    @Autowired
    private CourseRepo courseRepo;


    @PostMapping("/course")
    ResponseEntity<Course> addCourse(@RequestBody Course course) {

        Course temp = courseService.addCourse(
                course.getCourseCode(),
                course.getCourseName(),
                course.getCourseDescription()
        );

        return ResponseEntity.ok(temp);
    }

    @PostMapping("/add-cos")
    public String addCourseOutcomes(@RequestBody AddCORequest request){
        programServices.addPOs(
                request.getCourseId(),
                request.getCos()
        );
        return "COs added successfully";
    }
    @GetMapping("/course")
    public Course addCourseOutcomes(@RequestParam String courseCode){
        return courseRepo.findById(courseCode).orElse(null);
    }

}
