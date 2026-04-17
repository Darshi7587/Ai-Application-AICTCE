package com.example.edumap.Service;

import com.example.edumap.Entity.CO.*;
import com.example.edumap.Repository.CourseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
@Service
public class COMapperService {

    @Autowired
    private CourseRepo courseRepo;

    @Transactional
    public Course mapAndSave(List<ProgramServices.result> results, String courseId) {

        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        for (ProgramServices.result result : results) {

            CourseOutcomes coEntity = new CourseOutcomes();
            coEntity.setCO(result.co());

            coEntity.setCourse(course);
            course.getCourseOutcomesList().add(coEntity);

            for (ProgramServices.Keywords k : result.keywords()) {

                Keywords keywordEntity = new Keywords();
                keywordEntity.setKeyword(k.keywords());

                keywordEntity.setCourseOutcomes(coEntity);
                coEntity.getKeywords().add(keywordEntity);

                for (ProgramServices.keyword_reasons kr : k.reasons()) {

                    Keyword_Pos poEntity = new Keyword_Pos();
                    poEntity.setPo(kr.Po());
                    poEntity.setReason(kr.reason());

                    poEntity.setKeyword(keywordEntity);
                    keywordEntity.getReasons().add(poEntity);
                }
            }
        }

        return courseRepo.save(course);
    }
}