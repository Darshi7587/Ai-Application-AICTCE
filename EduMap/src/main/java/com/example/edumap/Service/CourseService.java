package com.example.edumap.Service;

import org.springframework.stereotype.Service;

import com.example.edumap.Entity.CO.Course;
import com.example.edumap.Repository.CourseRepo;

@Service
public class CourseService {

    private final CourseRepo courseRepo;
    public CourseService(CourseRepo courseRepo) {
        this.courseRepo = courseRepo;
    }

    public Course addCourse(String courseId, String courseName, String courseDescription) {
        // Handle null or empty courseId
        if (courseId == null || courseId.trim().isEmpty()) {
            // Generate a unique ID if not provided
            courseId = "COURSE_" + System.currentTimeMillis();
        }
        
        Course course = courseRepo.findById(courseId).orElse(null);
        if (course == null) {
            course = new Course();
            course.setCourseCode(courseId);
            course.setCourseName(courseName);
            course.setCourseDescription(courseDescription);
            return courseRepo.save(course);
        }
        return course;
    }

}
