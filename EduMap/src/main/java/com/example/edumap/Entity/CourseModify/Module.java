package com.example.edumap.Entity.CourseModify;

import java.util.List;

public record Module(
        String moduleName,
        List<String> topics
) {}