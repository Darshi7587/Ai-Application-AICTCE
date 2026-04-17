package com.example.edumap.DTOs;

import java.util.List;

public class KeywordDTO {
    private String keyword;
    private List<PoMappingDTO> pos;

    public KeywordDTO(String keyword, List<PoMappingDTO> pos) {
        this.keyword = keyword;
        this.pos = pos;
    }
}