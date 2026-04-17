package com.example.edumap.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AICourseGeneration {
    @Autowired
    ChatClient chatClient;

    @Value("classpath:prompt/generateCoMapping.prompts")
    Resource generateCosMapping;


    public List<String> CoKeyGeneration(String co, String level) {


                    List<String> response = chatClient.prompt().user(u -> u.text(generateCosMapping).params(Map.of("CO",co))).call().entity(CoKeys.class).keys;
                    return response;
                }

                public record CoKeys(List<String>keys){}


            }
