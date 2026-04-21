//package com.example.edumap;
//
//import com.example.edumap.Service.AICOGeneration;
//import com.example.edumap.Service.AiTools;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
//import org.springframework.ai.chat.memory.ChatMemory;
//import org.springframework.ai.vectorstore.VectorStore;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.core.io.Resource;
//import org.springframework.test.context.junit4.SpringRunner;
//
//import java.util.*;
//
//@Slf4j
//@RunWith(SpringRunner.class)
//@SpringBootTest
//public class CoMappingTest {
//
//    @Autowired
//    private VectorStore vectorStore;
//
//    @Autowired
//    private AICOGeneration aiCourseGeneration;
//
//    @Autowired
//    private ChatClient chatClient;
//
//    @Autowired
//    AiTools tools;
//
//    @Value("classpath:prompt/COPO_Prompt.prompts")
//    Resource COPO_Prompt;
//
//    @Test
//    public void test0() {
//
//        List<String> cos = List.of(
//                "CO1: Demonstrate the basic concepts of internet of things using ESP32 for real time applications.",
//                "CO2: illustrate the working principles of ESP32 internal components.",
//                "CO3: Analyze different types of sensors for electrical and electronic applications",
//                "CO4: Apply the necessary analog and digital sensor system components with respect to type, functions, operation and interaction, and proper selection"
//        );
//        for (String co : cos) {
//
//            List<String> keys =
//                    aiCourseGeneration.CoKeyGeneration(co, "1");
////            List.of("Problem Solving", "Technical Competence", "Application Development");
//
//           result r =chatClient.prompt()
//                    .user(u -> u.text(COPO_Prompt).params(Map.of("KEYWORDS", keys,"CO",co)))
//                    .advisors(
//                            QuestionAnswerAdvisor.builder(vectorStore).build()
//                    )
//                    .tools(tools)
//                    .call()
//                    .entity(result.class);
//           if(r!=null){
//               log.info(r.toString());
//           }
//        }
//    }
//    public record AiRes(String co, Map<String, List<String>> mapOfEachKeyWordsWithPOs) {}
//
//    @Test
//    public void test() {
//        log.info(chatClient
//                .prompt()
//                .user(" 'IoT concepts' which all pos it match ")
////                        .advisors(QuestionAnswerAdvisor.builder(vectorStore).build())
//                .tools(tools)
//                .call()
//                .entity(AiRes.class)
//                .toString());
//    }
//
//    @Test
//    public void test1() {
//        log.info(vectorStore.similaritySearch("").toString());
//    }
//
//    record result(String co ,List<Keywords> keywords){}
//    record Keywords(String keywords,List<keyword_reasons> reasons){ }
//    record keyword_reasons(String Po,String reason){}
//}