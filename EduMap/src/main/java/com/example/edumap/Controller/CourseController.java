package com.example.edumap.Controller;

import com.example.edumap.DTOs.AddCORequest;
import com.example.edumap.DTOs.ApiResponse;
import com.example.edumap.DTOs.CourseRequest;
import com.example.edumap.DTOs.ExportRequest;
import com.example.edumap.Entity.CO.Course;
import com.example.edumap.Repository.CourseRepo;
import com.example.edumap.Service.CourseService;
import com.example.edumap.Service.ExportService;
import com.example.edumap.Service.ProgramServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CourseController {

    @Autowired
    private CourseService courseService;
    @Autowired
    ProgramServices programServices;
    @Autowired
    private CourseRepo courseRepo;
    @Autowired
    private ExportService exportService;


    @PostMapping("/course")
    ResponseEntity<Course> addCourse(@RequestBody CourseRequest courseRequest) {

        Course temp = courseService.addCourse(
                courseRequest.getCode(),
                courseRequest.getName(),
                courseRequest.getDesc()
        );

        return ResponseEntity.ok(temp);
    }

    @PostMapping("/add-cos")
    public ResponseEntity<ApiResponse> addCourseOutcomes(@RequestBody AddCORequest request){
        try {
            programServices.addPOs(
                    request.getCourseId(),
                    request.getCos()
            );
            return ResponseEntity.ok(new ApiResponse("COs added successfully", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/course")
    public Course getCourse(@RequestParam String courseCode){
        return courseRepo.findById(courseCode).orElse(null);
    }

    @PostMapping("/export/docx")
    public ResponseEntity<?> exportCourseAsDocx(@RequestBody ExportRequest request) {
        try {
            byte[] docxBytes = exportService.generateCourseProposal(
                    request.getCourseCode(),
                    request.getCourseTitle(),
                    request.getCourseBranch(),
                    request.getCourseSem(),
                    request.getCos(),
                    request.getSyllabus(),
                    request.getMode()
            );

            String filename = request.getCourseCode() + "_" + request.getCourseTitle()
                    .replaceAll("[^a-zA-Z0-9]", "_") + ".docx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, 
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    .body(docxBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse("Error generating document: " + e.getMessage(), false));
        }
    }

}
