package com.example.edumap.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class AICOGeneration {
    @Autowired
    ChatClient chatClient;

    @Value("classpath:prompt/generateCoMapping.prompts")
    Resource generateCosMapping;

    public List<List<String>> CoKeyGeneration(List<String> cosList) {
        // ✅ INPUT VALIDATION: Return empty list instead of null
        if (cosList == null || cosList.isEmpty()) {
            return List.of();
        }
        
        try {
            AtomicInteger i = new AtomicInteger(1);
            String formattedCOs = cosList.stream()
                    .map(co -> "CO_" + i.getAndIncrement() +" " + co)
                    .collect(Collectors.joining("\n"));

            // ✅ TRY-CATCH: Graceful error handling instead of NPE
            CoKeys coKeys = chatClient.prompt()
                    .user(u -> u.text(generateCosMapping).params(Map.of("CO", formattedCOs)))
                    .call()
                    .entity(CoKeys.class);
            
            // ✅ NULL CHECK: Return empty list if response is null
            if (coKeys == null || coKeys.keys == null) {
                return List.of();
            }
            
            return coKeys.keys;
        } catch (Exception e) {
            System.err.println("❌ CoKeyGeneration error: " + e.getMessage());
            return List.of();  // ✅ Return empty list on exception
        }
    }

                public record CoKeys(List<List<String>>keys){}


            }
