package com.talentai.backend.evaluation;

import com.talentai.backend.ai.AiService;
import com.talentai.backend.candidate.Candidate;
import com.talentai.backend.offer.Offer;
import com.talentai.backend.rh.Rh;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EvaluationController.class)
class EvaluationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EvaluationRepository evaluationRepository;

    @MockBean
    private AiService aiService;

    @Test
    void shouldGenerateInterviewQuestions() throws Exception {
        Long evalId = 1L;
        String fakeQuestions = "<ul><li>Question 1?</li></ul>";

        Candidate candidate = Candidate.builder().id(10L).fullName("John").build();
        candidate.setCvFile(null);

        Offer offer = Offer.builder().id(20L).description("Job Java").build();

        Evaluation evaluation = Evaluation.builder()
                .id(evalId)
                .candidate(candidate)
                .offer(offer)
                .build();

        given(evaluationRepository.findById(evalId)).willReturn(Optional.of(evaluation));
        given(aiService.generateInterviewQuestions(anyString(), anyString())).willReturn(fakeQuestions);

        mockMvc.perform(post("/api/evaluations/" + evalId + "/questions"))
                .andExpect(status().isOk())
                .andExpect(content().string(fakeQuestions));
    }

    @Test
    void shouldGenerateSummary() throws Exception {
        Long evalId = 1L;
        String fakeSummary = "Candidat très pertinent.";

        Candidate candidate = Candidate.builder().id(10L).build();
        Offer offer = Offer.builder().id(20L).description("Job Desc").build();
        Evaluation evaluation = Evaluation.builder().id(evalId).candidate(candidate).offer(offer).build();

        given(evaluationRepository.findById(evalId)).willReturn(Optional.of(evaluation));
        given(aiService.generateSummary(anyString(), anyString())).willReturn(fakeSummary);

        mockMvc.perform(post("/api/evaluations/" + evalId + "/summary"))
                .andExpect(status().isOk())
                .andExpect(content().string(fakeSummary));
    }
}