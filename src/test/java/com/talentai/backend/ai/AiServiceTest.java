package com.talentai.backend.ai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @InjectMocks
    private AiService aiService;

    @Test
    void shouldScoreCvCorrectly() {
        String cvText = "Expert Java Spring Boot";
        String jobDesc = "Cherche développeur Java";
        String expectedResponse = "85";

        when(chatClient.prompt()
                .system(anyString())
                .user(anyString())
                .call()
                .content())
                .thenReturn(expectedResponse);

        String score = aiService.scoreCv(cvText, jobDesc);

        assertEquals("85", score);
    }

    @Test
    void shouldExtractDataFromCv() {
        String jsonResponse = "{\"skills\": [\"Java\"], \"yearsOfExperience\": 5}";

        when(chatClient.prompt()
                .system(anyString())
                .user(anyString())
                .call()
                .content())
                .thenReturn(jsonResponse);

        String result = aiService.extractDataFromCv("Mon CV texte...");

        assertEquals(jsonResponse, result);
    }
}