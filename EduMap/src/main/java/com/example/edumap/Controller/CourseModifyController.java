package com.example.edumap.Controller;

import com.example.edumap.Entity.CourseModify.CourseAnalysisResponse;
import com.example.edumap.Service.AICourseModification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/course-modify")
public class CourseModifyController {

    private final AICourseModification service;

    public CourseModifyController(AICourseModification service) {
        this.service = service;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseAnalysisResponse> upload(@RequestParam("file") MultipartFile file) {

            CourseAnalysisResponse response = service.enhanceCourseWithAI(file);
            return ResponseEntity.ok(response);
    }
}