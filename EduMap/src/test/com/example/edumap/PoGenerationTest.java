package com.example.edumap;

import com.example.edumap.Entity.Enum.ProgramOutcome_Constants;
import com.example.edumap.Service.AiTools;
import com.example.edumap.Service.NlpService;
import com.example.edumap.Service.PO_EmbeddingGeneration;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class PoGenerationTest {

    @Autowired
    PO_EmbeddingGeneration poEmbeddingGeneration;

    @Autowired
    AiTools tools;
    @Autowired
    NlpService nlpService;

    @Autowired
    ChatClient chatClient;

    @Autowired
    VectorStore vectorStore;

    @Test
    public void test() {
        List<Document> documents = new ArrayList<>();
        for (ProgramOutcome_Constants constants : ProgramOutcome_Constants.values()) {
            String poEmbeddingText = constants.name() + " " +
                    constants.getTitle() + " " +
                    constants.getDescription();
            Document document = new Document(poEmbeddingText);
            documents.add(document);
        }
            vectorStore.add(documents);
    }

//    @Test
//    public void test2(){
//        Document doc = new Document("i am ayush studies in reva");
//        vectorStore.add(Collections.singletonList(doc));
//
//    }
    @Test
    public void test3() {
        log.info(
                chatClient.prompt()
                        .user("""
You are an AICTE/NBA OBE evaluator.

Task:
Map EACH keyword independently to relevant Program Outcomes (PO1–PO12), using the parent Course Outcome (CO) as context.

Instructions:
1. The CO provides overall context — use it ONLY to understand domain meaning.
2. DO NOT merge or combine keywords.
3. For EACH keyword:
   - Perform independent semantic matching with PO definitions.
4. each keyword see all 12 PO which all it match add all

Output Format (STRICT):
<keyword> → [POx, POy]


Input:
CO1: Demonstrate the design and implementation of IoT-based systems using ESP32 for real-time monitoring and data acquisition.
Keywords:
    IoT-based systems
    ESP32
    Real-time monitoring
    Data acquisition
    Design and implementation
""")
                        .advisors(
                                QuestionAnswerAdvisor.builder(vectorStore).build()
                        )
                        .tools(tools)
                        .call()
                        .entity(result.class).toString()
        );
    }

    record result(String co ,List<Keywords> keywords){}
    record Keywords(String keywords,List<keyword_reasons> reasons){ }
    record keyword_reasons(String Po,String reason){}
}