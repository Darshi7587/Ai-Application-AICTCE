package com.example.edumap;

import com.example.edumap.Service.AICourseModification;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.api.OpenAiFileApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;

import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.mock.web.MockMultipartFile;

@SpringBootTest
public class UploadTest {

    @Autowired
    ChatClient client;

    @Test
    public void  upload() {

        Path path = Paths.get("/home/pancham-ayush/Desktop/a/EduMap/src/main/resources/prof_chaitra_maam_survey.pdf");

        FileSystemResource resource = new FileSystemResource(path);

        PagePdfDocumentReader reader = new PagePdfDocumentReader(resource);
        String text = reader.get().stream()
                .map(Document::getText)
                .collect(Collectors.joining(" "));

        String response = client.prompt()
                .user("Summarize this:\n" + text)
                .call()
                .content();

        System.out.println(text);

        System.out.println(response);
    }
    @Autowired
    AICourseModification courseModification;
    @Test
    public void  uploadFile() {

        Path path = Paths.get("/home/pancham-ayush/Desktop/a/EduMap/src/main/resources/prof_chaitra_maam_survey.pdf");
        MockMultipartFile file;
        try {
             file = new MockMultipartFile(
                    "file",
                    "sample.pdf",
                    "application/pdf",
                    Files.readAllBytes(path)
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println(courseModification.enhanceCourseWithAI(file));

    }
}
