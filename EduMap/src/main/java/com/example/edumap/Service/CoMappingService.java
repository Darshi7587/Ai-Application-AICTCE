package com.example.edumap.Service;

import com.example.edumap.DTOs.CoRequest;
import com.example.edumap.DTOs.CoResponse;
import org.springframework.stereotype.Service;

@Service
public class CoMappingService {

    public CoResponse process(CoRequest request) {
        CoResponse response = new CoResponse(
        );
        response.setMessage("CO Mapping Done Successfully");
        return response;
    }
}