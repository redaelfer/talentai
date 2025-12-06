package com.talentai.backend.candidate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentai.backend.OfferRepository;
import com.talentai.backend.ai.AiService;
import com.talentai.backend.evaluation.EvaluationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock private CandidateRepository candidateRepository;
    @Mock private OfferRepository offerRepository;
    @Mock private EvaluationRepository evaluationRepository;
    @Mock private AiService aiService;
    @Mock private ObjectMapper objectMapper;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private CandidateService candidateService;

    @Test
    void shouldCreateCandidate() {
        CandidateRequest req = new CandidateRequest();
        req.setFullName("John Doe");
        req.setEmail("john@test.com");

        Candidate saved = Candidate.builder().id(1L).fullName("John Doe").email("john@test.com").build();

        when(candidateRepository.save(any(Candidate.class))).thenReturn(saved);

        Candidate result = candidateService.create(req);

        assertEquals("John Doe", result.getFullName());
    }

    @Test
    void shouldThrowExceptionIfAlreadyApplied() {
        Long candidateId = 1L;
        Long offerId = 2L;

        when(evaluationRepository.existsByCandidateIdAndOfferId(candidateId, offerId)).thenReturn(true);

        assertThrows(RuntimeException.class, () ->
                candidateService.evaluateCv(candidateId, "Job Desc", offerId)
        );
    }
}