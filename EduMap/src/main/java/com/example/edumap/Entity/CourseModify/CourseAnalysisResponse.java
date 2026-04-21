package com.example.edumap.Entity.CourseModify;

import com.example.edumap.Service.ProgramServices;
import com.example.edumap.Service.ProgramServices.result;

import java.util.List;

public record CourseAnalysisResponse(

        List<Topic> importantTopics,
        List<Topic> unnecessaryTopics,
        List<Topic> burdenTopics,
        List<String> improvements,
        List<Module> revisedStructure,
        List<ProgramServices.result> addPOs

) {}