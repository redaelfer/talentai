package com.talentai.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentai.backend.candidate.Candidate;
import com.talentai.backend.candidate.CandidateRepository;
import com.talentai.backend.rh.Rh;
import com.talentai.backend.rh.RhRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private CandidateRepository candidateRepository;
    @MockBean private RhRepository rhRepository;

    @Test
    void shouldLoginCandidateSuccess() throws Exception {
        String username = "john_doe";
        String password = "securepass";

        Candidate mockCandidate = new Candidate();
        mockCandidate.setId(1L);
        mockCandidate.setUsername(username);
        mockCandidate.setPassword(password);

        given(candidateRepository.findByUsername(username)).willReturn(Optional.of(mockCandidate));

        Map<String, String> loginPayload = Map.of("username", username, "password", password);

        mockMvc.perform(post("/api/auth/candidate/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_CANDIDAT"))
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void shouldFailLoginIfPasswordWrong() throws Exception {
        String username = "john_doe";
        Candidate mockCandidate = new Candidate();
        mockCandidate.setUsername(username);
        mockCandidate.setPassword("correct_password");

        given(candidateRepository.findByUsername(username)).willReturn(Optional.of(mockCandidate));

        Map<String, String> badLogin = Map.of("username", username, "password", "WRONG_PASS");

        mockMvc.perform(post("/api/auth/candidate/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRegisterRh() throws Exception {
        Rh newRh = new Rh();
        newRh.setUsername("rh_manager");
        newRh.setPassword("pass");
        newRh.setNomEntreprise("TechCorp");

        given(rhRepository.findByUsername("rh_manager")).willReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/rh/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRh)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Compte RH créé avec succès pour TechCorp"));
    }
}