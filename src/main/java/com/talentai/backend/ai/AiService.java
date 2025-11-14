package com.talentai.backend.ai;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class AiService {

    private final WebClient client;

    public AiService() {
        this.client = WebClient.builder()
                .baseUrl("http://localhost:11434") // port par défaut d’Ollama
                .build();
    }

    /**
     * Appelle Ollama pour évaluer la compatibilité entre un CV et une offre.
     */
    public String scoreCv(String cvText, String jobDescription) {
        String prompt = """
                Tu es un assistant RH intelligent. 
                Lis le CV suivant et donne un score de compatibilité (0 à 100) 
                avec l’offre d’emploi ci-dessous, en te basant sur les compétences et l’expérience.

                CV:
                %s

                Offre:
                %s

                Donne seulement un nombre entier entre 0 et 100.
                """.formatted(cvText, jobDescription);

        Map<String, Object> body = Map.of(
                "model", "llama3",
                "prompt", prompt
        );

        StringBuilder response = new StringBuilder();

        client.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnNext(chunk -> {
                    Object content = chunk.get("response");
                    if (content != null) response.append(content.toString());
                })
                .blockLast();

        return response.toString().trim();
    }
}
