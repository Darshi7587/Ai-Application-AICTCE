package com.example.edumap.DTOs;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class AddCORequest {

    private String courseId;
    private List<String> cos;

}