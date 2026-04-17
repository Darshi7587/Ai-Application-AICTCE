package com.example.edumap.Service;

import com.example.edumap.DTOs.PoMappingDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiService {

    public List<PoMappingDTO> getPoMappings(String keyword, String co) {

        // Replace with chatClient later
        return switch (keyword.toLowerCase()) {

            case "iot concepts" -> List.of(
                    new PoMappingDTO("PO1", "Engineering fundamentals"),
                    new PoMappingDTO("PO5", "Modern tools")
            );

            case "esp32 applications" -> List.of(
                    new PoMappingDTO("PO1", "Engineering knowledge"),
                    new PoMappingDTO("PO11", "Project management")
            );

            default -> List.of(
                    new PoMappingDTO("PO2", "Problem analysis")
            );
        };
    }
}