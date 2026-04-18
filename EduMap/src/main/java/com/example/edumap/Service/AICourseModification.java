package com.example.edumap.Service;

import com.example.edumap.Entity.CourseModify.CourseAnalysisResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.writer.FileDocumentWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AICourseModification {

    private final ChatClient chatClient ;
    public AICourseModification(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    @Value("classpath:prompt/CourseModification.prompts")
    private Resource promptResource;


    public CourseAnalysisResponse enhanceCourseWithAI(MultipartFile file) {

        Resource resource = file.getResource();

        PagePdfDocumentReader reader = new PagePdfDocumentReader(resource);

        String text = reader.get().stream()
                .map(Document::getText)
                .collect(Collectors.joining(" "));

        return chatClient
                .prompt()
                .user(u -> u.text(promptResource).params(Map.of("course_content",text)))
                .call()
                .entity(CourseAnalysisResponse.class);



    }
}
