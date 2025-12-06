package com.talentai.backend.candidate;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CandidateController.class)
class CandidateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CandidateService candidateService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnCandidateById() throws Exception {
        Candidate c = Candidate.builder()
                .id(1L)
                .fullName("Alice Dev")
                .email("alice@test.com")
                .build();

        given(candidateService.one(1L)).willReturn(c);

        mockMvc.perform(get("/api/candidates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Alice Dev"))
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    void shouldCreateCandidate() throws Exception {
        CandidateRequest req = new CandidateRequest();
        req.setFullName("Bob Front");
        req.setEmail("bob@test.com");
        req.setTitre("Dev React");
        req.setTelephone("0600000000");

        Candidate saved = Candidate.builder()
                .id(2L)
                .fullName("Bob Front")
                .build();

        given(candidateService.create(any(CandidateRequest.class))).willReturn(saved);

        mockMvc.perform(post("/api/candidates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.fullName").value("Bob Front"));
    }

    @Test
    void shouldEvaluateCandidate() throws Exception {
        // Arrange
        Long candidateId = 1L;
        String jobDesc = "Cherche dev Java";
        Long offerId = 5L;
        Map<String, Object> body = Map.of(
                "jobDescription", jobDesc,
                "offerId", offerId
        );

        given(candidateService.evaluateCv(eq(candidateId), eq(jobDesc), eq(offerId))).willReturn(85);

        mockMvc.perform(post("/api/candidates/" + candidateId + "/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("85"));
    }
}