package com.talentai.backend.candidate;

import com.talentai.backend.ai.AiService;
import com.talentai.backend.evaluation.Evaluation;
import com.talentai.backend.evaluation.EvaluationRepository;
import com.talentai.backend.offer.Offer;
import com.talentai.backend.offer.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final OfferRepository offerRepository;
    private final EvaluationRepository evaluationRepository;
    private final AiService aiService;

    private final SimpMessagingTemplate messagingTemplate;

    public List<Candidate> all() {
        return candidateRepository.findAll();
    }

    public Candidate one(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé avec l'id : " + id));
    }

    public Candidate create(CandidateRequest req) {
        Candidate candidate = Candidate.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .titre(req.getTitre())
                .telephone(req.getTelephone())
                .build();
        return candidateRepository.save(candidate);
    }

    public Candidate uploadCv(Long id, MultipartFile file) throws IOException {
        Candidate candidate = one(id);
        candidate.setCvFile(file.getBytes());
        candidate.setCvFileName(file.getOriginalFilename());
        candidate.setCvContentType(file.getContentType());
        return candidateRepository.save(candidate);
    }

    public int evaluateCv(Long candidateId, String jobDescription, Long offerId) throws IOException {
        if (evaluationRepository.existsByCandidateIdAndOfferId(candidateId, offerId)) {
            throw new RuntimeException("ALREADY_APPLIED");
        }
        Candidate candidate = one(candidateId);
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + offerId));

        if (candidate.getCvFile() == null) {
            throw new RuntimeException("CV not found for candidate, cannot evaluate.");
        }

        String cvText = extractTextFromPdf(candidate.getCvFile());
        if (cvText.isBlank()) return 0;

        String scoreResponse = aiService.scoreCv(cvText, jobDescription);

        int score = 0;
        try {
            String cleanResponse = scoreResponse.replaceAll("[^\\d]", "");
            if (!cleanResponse.isEmpty()) {
                score = Integer.parseInt(cleanResponse);
            }
        } catch (NumberFormatException e) {
            System.err.println("Ollama a retourné une réponse non numérique: " + scoreResponse);
        }

        Evaluation evaluation = Evaluation.builder()
                .candidate(candidate)
                .offer(offer)
                .score(score)
                .status("NEW")
                .build();

        evaluationRepository.save(evaluation);

        if (offer.getRh() != null) {
            String destination = "/topic/rh/" + offer.getRh().getId() + "/notifications";
            String notificationMessage = "Nouvelle candidature de " + candidate.getFullName() + " pour " + offer.getTitle();

            // Envoi d'un objet JSON simple
            messagingTemplate.convertAndSend(destination, Map.of(
                    "message", notificationMessage,
                    "score", score,
                    "offerId", offer.getId()
            ));
        }

        return score;
    }

    public Candidate updateCandidate(Long id, CandidateRequest candidateRequest) {
        Candidate existingCandidate = one(id);
        existingCandidate.setFullName(candidateRequest.getFullName());
        existingCandidate.setEmail(candidateRequest.getEmail());
        existingCandidate.setTitre(candidateRequest.getTitre());
        existingCandidate.setTelephone(candidateRequest.getTelephone());
        return candidateRepository.save(existingCandidate);
    }

    private String extractTextFromPdf(byte[] pdfData) throws IOException {
        if (pdfData == null || pdfData.length == 0) {
            return "";
        }
        try (PDDocument document = Loader.loadPDF(pdfData)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'extraction du texte PDF: " + e.getMessage());
            return "";
        }
    }
}