package com.example.edumap.Service;

import com.example.edumap.Entity.CO.Course;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AiTools {
    @Autowired
    AICOGeneration aiCourseGeneration;

    @Autowired
    ChatClient chatClient;
    @Tool(
            name = "get_all_pos",
            description = "Returns all Program Outcomes (PO1–PO12) with titles and descriptions for evaluation"
    )    public static String getAllPOsHardcoded() {
        return """
PO1: Engineering Knowledge - Apply mathematics, science, and engineering fundamentals to solve complex engineering problems
PO2: Problem Analysis - Identify, formulate, review research literature, and analyze complex engineering problems
PO3: Design / Development of Solutions - Design solutions for complex engineering problems and design system components or processes
PO4: Investigation of Complex Problems - Use research-based knowledge and methods including design of experiments and analysis of data
PO5: Modern Tool Usage - Create, select, and apply appropriate techniques, resources, and modern engineering tools
PO6: Engineer and Society - Apply reasoning informed by contextual knowledge to assess societal, health, safety, and legal issues
PO7: Environment and Sustainability - Understand the impact of engineering solutions in societal and environmental contexts
PO8: Ethics - Apply ethical principles and commit to professional ethics and responsibilities
PO9: Individual and Team Work - Function effectively as an individual and as a member or leader in diverse teams
PO10: Communication - Communicate effectively on complex engineering activities with the engineering community
PO11: Project Management and Finance - Demonstrate knowledge and understanding of engineering management principles
PO12: Life-long Learning - Recognize the need for and engage in independent and life-long learning
""";
    }

    @Value("classpath:prompt/COPO_Prompt.prompts")
    Resource COPO_Prompt;


    @Autowired
    VectorStore vectorStore;

    @Tool(
            name = "Get_CO_PO_mapping",
            description = "Maps a list of Course Outcomes (COs) to corresponding Program Outcomes (POs) and returns structured mapping results for each CO."
    )
    public List<ProgramServices.result> addPOs(
            @ToolParam(
                    description = "List of Course Outcome (CO) , get CO from each unit."
            )
            List<String> COs
    ){
        List<ProgramServices.result> resultList = new ArrayList<>();
        List<List<String>> keys = aiCourseGeneration.CoKeyGeneration(COs);
        AtomicInteger i = new AtomicInteger();
        for(String co : COs){


            ProgramServices.result r =chatClient.prompt()
                    .user(u -> u.text(COPO_Prompt).params(Map.of("KEYWORDS", keys.get(i.getAndIncrement()),"CO",co)))
                    .advisors(
                            QuestionAnswerAdvisor.builder(vectorStore).build()
                    )
                    .call()
                    .entity(ProgramServices.result.class);
        }
        if(!resultList.isEmpty())
        {
            return resultList;
        }
        return null;
    }


}
