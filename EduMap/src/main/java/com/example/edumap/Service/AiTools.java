package com.example.edumap.Service;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

@Service
public class AiTools {
    @Tool(
            name = "get_all_pos",
            description = "Returns all Program Outcomes (PO1–PO12) with titles and descriptions for evaluation"
    )    public static String getAllPOsHardcoded() {
        return """
PO1: Engineering Knowledge - Apply mathematics, science, and engineering fundamentals to solve complex engineering problems
PO2: Problem Analysis - Identify, formulate, review research literature, and analyze complex engineering problems
PO3: Design / Development of Solutions - Design solutions for complex engineering problems and design system components or processes
PO4: Investigation of Complex Problems - Use research-based knowledge and methods including design of experiments and analysis of data
PO5: Modern Tool Usage - Create, select, and apply appropriate techniques, resources, and modern engineering tools
PO6: Engineer and Society - Apply reasoning informed by contextual knowledge to assess societal, health, safety, and legal issues
PO7: Environment and Sustainability - Understand the impact of engineering solutions in societal and environmental contexts
PO8: Ethics - Apply ethical principles and commit to professional ethics and responsibilities
PO9: Individual and Team Work - Function effectively as an individual and as a member or leader in diverse teams
PO10: Communication - Communicate effectively on complex engineering activities with the engineering community
PO11: Project Management and Finance - Demonstrate knowledge and understanding of engineering management principles
PO12: Life-long Learning - Recognize the need for and engage in independent and life-long learning
""";
    }
}
