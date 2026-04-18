package com.example.edumap.Entity.CourseModify;

import java.util.List;

public record CourseAnalysisResponse(

        List<Topic> importantTopics,
        List<Topic> unnecessaryTopics,
        List<Topic> burdenTopics,
        List<String> improvements,
        List<Module> revisedStructure

) {}