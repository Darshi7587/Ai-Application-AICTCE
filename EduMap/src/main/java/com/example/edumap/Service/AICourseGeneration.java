package com.example.edumap.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class AICourseGeneration {
    @Autowired
    ChatClient chatClient;

    @Value("classpath:prompt/generateCoMapping.prompts")
    Resource generateCosMapping;


    public List<List<String>> CoKeyGeneration(List<String> cosList, String level) {

        AtomicInteger i = new AtomicInteger(1);
        String formattedCOs = cosList.stream()
                .map(co -> "CO_" + i.getAndIncrement() +" " + co)
                .collect(Collectors.joining("\n"));



        List<List<String>> response = chatClient.prompt().user(u -> u.text(generateCosMapping).params(Map.of("CO",formattedCOs))).call().entity(CoKeys.class).keys;
                    return response;
                }

                public record CoKeys(List<List<String>>keys){}


            }
