package com.example.edumap.Service;

import com.example.edumap.Entity.Enum.ProgramOutcome_Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PO_EmbeddingGeneration {

    @Value("classpath:prompt/generatePoMapping.prompts")
    Resource generatePOsMapping;
    private final ChatClient chatClient;
    public PO_EmbeddingGeneration(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public Map<String,List<String>> getPOKeys(){

        var result = new HashMap<String, List<String>>();
        for (ProgramOutcome_Constants constants : ProgramOutcome_Constants.values()) {
           AiResponse response = chatClient.prompt()
                    .user(promptUserSpec ->promptUserSpec.text(generatePOsMapping)
                            .params(Map.of("CO",constants.getTitle()+" : "+constants.getDescription()))
                    )
                   .advisors( user -> user.param(ChatMemory.CONVERSATION_ID,"a"))
                    .call()
                    .entity(AiResponse.class);


           if (response!= null) {
               result.put(constants.name(), response.keys());
               log.info(constants.name()+"   "+response.toString());
           }

        }
        return result;
    }

    record AiResponse(List<String> keys){}
}
