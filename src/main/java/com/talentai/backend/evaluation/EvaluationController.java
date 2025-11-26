package com.talentai.backend.evaluation;

import com.talentai.backend.ai.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
// Imports pour PDFBox (assurez-vous de les avoir, comme dans CandidateService)
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EvaluationController {

    private final EvaluationRepository repository;
    private final AiService aiService;

    // --- Endpoint pour générer des questions IA ---
    @PostMapping("/{id}/questions")
    @Transactional // Important pour lire le CV (LOB)
    public String generateQuestions(@PathVariable Long id) throws IOException {
        Evaluation eval = repository.findById(id).orElseThrow();

        // 1. Extraire le texte du CV
        String cvText = "";
        if (eval.getCandidate().getCvFile() != null) {
            try (PDDocument document = Loader.loadPDF(eval.getCandidate().getCvFile())) {
                PDFTextStripper stripper = new PDFTextStripper();
                cvText = stripper.getText(document);
            } catch (Exception e) {
                System.err.println("Erreur lecture PDF: " + e.getMessage());
            }
        }

        // 2. Appeler l'IA
        String questions = aiService.generateInterviewQuestions(cvText, eval.getOffer().getDescription());

        // 3. Sauvegarder
        eval.setInterviewQuestions(questions);
        repository.save(eval);

        return questions;
    }

    // --- Endpoint pour changer le statut (Kanban) ---
    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id, @RequestBody String status) {
        Evaluation eval = repository.findById(id).orElseThrow();
        // Nettoyage des guillemets si le frontend envoie "NEW" avec des quotes
        eval.setStatus(status.replace("\"", ""));
        repository.save(eval);
    }

    @GetMapping("/offer/{offerId}")
    @Transactional(readOnly = true)
    public List<EvaluationDTO> getByOffer(@PathVariable Long offerId) {
        List<Evaluation> evaluations = repository.findByOfferId(offerId);

        return evaluations.stream()
                .map(e -> new EvaluationDTO(
                        e.getId(), // ID de l'évaluation
                        e.getCandidate().getId(),
                        e.getCandidate().getFullName(),
                        e.getCandidate().getEmail(),
                        e.getCandidate().getTitre(),
                        e.getCandidate().getTelephone(),
                        e.getScore(),
                        e.getStatus() != null ? e.getStatus() : "NEW", // Statut
                        e.getInterviewQuestions() // Questions
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/candidate/{candidateId}/offer-ids")
    public List<Long> getAppliedOfferIds(@PathVariable Long candidateId) {
        return repository.findByCandidateId(candidateId).stream()
                .map(eval -> eval.getOffer().getId())
                .collect(Collectors.toList());
    }

    public record EvaluationDTO(
            Long id,
            Long candidateId,
            String candidateName,
            String email,
            String titre,
            String telephone,
            int score,
            String status,
            String interviewQuestions
    ) {}
}