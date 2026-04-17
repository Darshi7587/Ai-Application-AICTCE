package com.example.edumap.Controller;

import com.example.edumap.Service.ProgramServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CourseController2 {

    @Autowired
    ProgramServices programServices;

    @GetMapping
    public Object x(@RequestParam String x){
        return programServices.getKeyWords(x);
    }
}
