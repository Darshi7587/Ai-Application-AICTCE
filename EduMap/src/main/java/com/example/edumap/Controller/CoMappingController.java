package com.example.edumap.Controller;

import com.example.edumap.DTOs.CoRequest;
import com.example.edumap.DTOs.CoResponse;
import com.example.edumap.Service.CoMappingService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comap")
@RequiredArgsConstructor
public class CoMappingController {

    private final CoMappingService service;  // ✅ lowercase

    @PostMapping
    public ResponseEntity<CoResponse> map(@RequestBody CoRequest request) {
        return ResponseEntity.ok(service.process(request)); // ✅ use service
    }
}