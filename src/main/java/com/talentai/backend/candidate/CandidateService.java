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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

// import java.io.ByteArrayInputStream; // <-- Cet import n'est plus nécessaire
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor // Gère l'injection des 'final'
public class CandidateService {

    // Répertoires (Repositories) nécessaires
    private final CandidateRepository candidateRepository;
    private final OfferRepository offerRepository;
    private final EvaluationRepository evaluationRepository;

    // Service IA
    private final AiService aiService;

    /**
     * Renvoie la liste de tous les candidats (appelé par GET /api/candidates)
     */
    public List<Candidate> all() {
        return candidateRepository.findAll();
    }

    /**
     * Renvoie un candidat par son ID (appelé par GET /api/candidates/{id})
     */
    public Candidate one(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));
    }

    /**
     * Crée un nouveau candidat (appelé par POST /api/candidates)
     */
    public Candidate create(CandidateRequest req) {
        Candidate candidate = Candidate.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .titre(req.getTitre())
                .telephone(req.getTelephone())
                .build();
        return candidateRepository.save(candidate);
    }

    /**
     * Attache un fichier CV à un candidat (appelé par POST /api/candidates/{id}/cv)
     */
    public Candidate uploadCv(Long id, MultipartFile file) throws IOException {
        Candidate candidate = one(id); // Réutilise la méthode 'one' pour trouver le candidat

        candidate.setCvFile(file.getBytes());
        candidate.setCvFileName(file.getOriginalFilename());
        candidate.setCvContentType(file.getContentType());

        return candidateRepository.save(candidate);
    }

    /**
     * Évalue le CV d'un candidat pour une offre (appelé par POST /api/candidates/{id}/evaluate)
     */
    public int evaluateCv(Long candidateId, String jobDescription, Long offerId) throws IOException {
        Candidate candidate = one(candidateId);
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + offerId));

        if (candidate.getCvFile() == null) {
            throw new RuntimeException("CV not found for candidate, cannot evaluate.");
        }

        // 1. Extraire le texte du PDF
        String cvText = extractTextFromPdf(candidate.getCvFile());
        if (cvText.isBlank()) {
            System.err.println("Avertissement: Impossible d'extraire le texte du PDF pour le candidat ID: " + candidateId);
        }

        // 2. Appeler Ollama (votre AiService)
        String scoreResponse = aiService.scoreCv(cvText, jobDescription);

        // 3. Nettoyer et convertir la réponse de l'IA en nombre
        int score = 0;
        try {
            // Supprime tout ce qui n'est pas un chiffre (au cas où Llama répond "Score: 85")
            String cleanResponse = scoreResponse.replaceAll("[^\\d]", "");
            if (!cleanResponse.isEmpty()) {
                score = Integer.parseInt(cleanResponse);
            }
        } catch (NumberFormatException e) {
            System.err.println("Ollama a retourné une réponse non numérique: " + scoreResponse);
            // score reste 0 si le parsing échoue
        }


        // 4. Sauvegarder cette évaluation dans la base de données
        Evaluation evaluation = Evaluation.builder()
                .candidate(candidate)
                .offer(offer)
                .score(score)
                .build();

        evaluationRepository.save(evaluation);

        return score;
    }

    // Note: La méthode "updateCandidate" n'est pas utilisée par votre
    // CandidateController, mais elle est prête si vous ajoutez un endpoint PUT
    public Candidate updateCandidate(Long id, CandidateRequest candidateRequest) {
        Candidate existingCandidate = one(id); // Réutilise la méthode 'one'

        existingCandidate.setFullName(candidateRequest.getFullName());
        existingCandidate.setEmail(candidateRequest.getEmail());
        existingCandidate.setTitre(candidateRequest.getTitre());
        existingCandidate.setTelephone(candidateRequest.getTelephone());

        return candidateRepository.save(existingCandidate);
    }


    /**
     * Nouvelle méthode privée pour lire le texte d'un PDF en utilisant PDFBox 3.x
     */
    private String extractTextFromPdf(byte[] pdfData) throws IOException {
        if (pdfData == null || pdfData.length == 0) {
            return "";
        }

        // --- CORRECTION ---
        // On passe 'pdfData' (un byte[]) directement, comme l'erreur le suggère
        try (PDDocument document = Loader.loadPDF(pdfData)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
        // --- FIN CORRECTION ---
    }
}