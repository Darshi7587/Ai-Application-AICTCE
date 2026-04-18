package com.example.edumap.DTOs;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportRequest {
    private String courseCode;
    private String courseTitle;
    private String courseBranch;
    private String courseSem;
    private List<String> cos;
    private List<Map<String, Object>> syllabus;
    private String mode;
}
