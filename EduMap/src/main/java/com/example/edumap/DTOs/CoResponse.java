package com.example.edumap.DTOs;

import java.util.List;

public class CoResponse {

    private String message;
    private List<KeywordDTO> keywords;

    // ✅ DEFAULT CONSTRUCTOR (VERY IMPORTANT)
    public CoResponse() {
    }

    // ✅ PARAMETERIZED CONSTRUCTOR
    public CoResponse(String message, List<KeywordDTO> keywords) {
        this.message = message;
        this.keywords = keywords;
    }

    // GETTERS
    public String getMessage() {
        return message;
    }

    public List<KeywordDTO> getKeywords() {
        return keywords;
    }

    // SETTERS
    public void setMessage(String message) {
        this.message = message;
    }

    public void setKeywords(List<KeywordDTO> keywords) {
        this.keywords = keywords;
    }
}