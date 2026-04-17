package com.example.edumap;

import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.ling.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

@SpringBootTest
@Slf4j
class EduMapApplicationTests {

    @Autowired
    VectorStore vectorStore;

    @Test
    void contextLoads() {
//        System.out.println("The Spring context loaded perfectly!");
//        List<Document> documents = new ArrayList<>();
//////        documents.add(new Document("Spring AI rocks!! Spring AI rocks!! Spring AI rocks!! Spring AI rocks!! Spring AI rocks!!", Map.of("meta1", "meta1")));
////////        documents.add(new Document("The World is Big and Salvation Lurks Around the Corner"));
////////        documents.add(new Document("You walk forward facing the past and you turn back toward the future.", Map.of("meta2", "meta2")));
//////
//        documents.add(new Document("time", Map.of("metae", "meta3")));
//////
//        vectorStore.add(documents);
////
        System.out.println(vectorStore.similaritySearch(" time big  future").stream().findFirst().get());

//
//                Properties props = new Properties();
//                props.setProperty("annotators", "tokenize,ssplit,pos,lemma");
//
//                StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
//
//                String text = "The children are not running in the park";
//
//                CoreDocument document = new CoreDocument(text);
//                pipeline.annotate(document);
//
//                for (CoreLabel token : document.tokens()) {
//
//                    String lemma = token.lemma();
//                    String pos = token.tag();
//
//                    if(!(pos.equals("DT") || pos.equals("IN") || pos.equals("CC"))){
//                        System.out.println(lemma);
//                    }
//                }
            }


}