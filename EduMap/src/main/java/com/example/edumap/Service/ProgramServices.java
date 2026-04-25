package com.example.edumap.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.example.edumap.Entity.CO.Course;
import com.example.edumap.Repository.CourseRepo;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProgramServices {




    @Value("classpath:prompt/COPO_Prompt.prompts")
    Resource COPO_Prompt;

    private final ChatClient chatClient;

    private final CourseRepo courseRepo;

    private final AICOGeneration aiCourseGeneration;


    private final VectorStore vectorStore;


    private final AiTools tools;

    private final COMapperService coMapperService;
    public ProgramServices(ChatClient chatClient, CourseRepo courseRepo, AICOGeneration aiCourseGeneration, VectorStore vectorStore, AiTools tools, COMapperService coMapperService) {
        this.chatClient = chatClient;
        this.courseRepo = courseRepo;
        this.aiCourseGeneration = aiCourseGeneration;
        this.vectorStore = vectorStore;
        this.tools = tools;
        this.coMapperService = coMapperService;
    }


    public Course addPOs(String courseId, List<String>COs){
        Optional<Course> courseOptional= courseRepo.findById(courseId);
        if(courseOptional.isEmpty())
            return null;
        Course course = courseOptional.get();
        List<result> resultList = new ArrayList<>();
        List<List<String>> keys = aiCourseGeneration.CoKeyGeneration(COs);
        
        // ✅ NULL CHECK: Fail with clear error message instead of NPE
        if (keys == null || keys.isEmpty()) {
            log.error("❌ CoKeyGeneration returned null or empty list");
            throw new RuntimeException("Failed to generate CO keywords. Please check backend logs and try again.");
        }
        
        AtomicInteger i = new AtomicInteger();
        for(String co : COs){
            // ✅ BOUNDS CHECK: Prevent out-of-bounds array access
            if (i.get() >= keys.size()) {
                log.warn("⚠️ Index out of bounds: " + i.get() + " >= " + keys.size() + ". Skipping remaining COs.");
                break;
            }

            result r = chatClient.prompt()
                    .user(u -> u.text(COPO_Prompt).params(Map.of("KEYWORDS", keys.get(i.getAndIncrement()),"CO",co)))
                    .advisors(
                            QuestionAnswerAdvisor.builder(vectorStore).build()
                    )
                    .tools(tools)
                    .call()
                    .entity(result.class);
            if (r != null) {
                resultList.add(r);
                log.info(r.toString());
            }
        }
        if(!resultList.isEmpty())
        {
            return coMapperService.mapAndSave(resultList,courseId);
        }
        return null;
    }

    public record result(String co , List<Keywords> keywords){}
    public record Keywords(String keywords,List<keyword_reasons> reasons){ }
    public record keyword_reasons(String Po,String reason){}

}
