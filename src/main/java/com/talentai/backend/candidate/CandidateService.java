package com.talentai.backend.candidate;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.talentai.backend.ai.AiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import com.talentai.backend.offer.Offer;
import com.talentai.backend.offer.OfferRepository;
import com.talentai.backend.evaluation.Evaluation;
import com.talentai.backend.evaluation.EvaluationRepository;


@Service
public class CandidateService {

    private final CandidateRepository repo;

    public List<Candidate> all() {
        return repo.findAll();
    }

    public Candidate one(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Candidat introuvable"));
    }

    public Candidate create(CandidateRequest req) {
        Candidate c = Candidate.builder()
                .fullName(req.fullName())
                .email(req.email())
                .build();
        return repo.save(c);
    }

    public Candidate uploadCv(Long id, MultipartFile file) throws IOException {
        Candidate c = one(id);
        c.setCvFile(file.getBytes());
        c.setCvFileName(file.getOriginalFilename());
        c.setCvContentType(file.getContentType());
        return repo.save(c);
    }

    public byte[] downloadCv(Long id) {
        Candidate c = one(id);
        if (c.getCvFile() == null)
            throw new RuntimeException("Aucun CV trouvé pour ce candidat");
        return c.getCvFile();
    }

    private final AiService aiService;
    private final OfferRepository offerRepo;
    private final EvaluationRepository evalRepo;


    public CandidateService(CandidateRepository repo, AiService aiService,
                            OfferRepository offerRepo, EvaluationRepository evalRepo) {
        this.repo = repo;
        this.aiService = aiService;
        this.offerRepo = offerRepo;
        this.evalRepo = evalRepo;
    }


    /**
     * Analyse IA : extrait le texte du CV et retourne un score
     */
    public int evaluateCv(Long candidateId, String jobDescription, Long offerId) {
        Candidate c = one(candidateId);
        Offer o = offerRepo.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (c.getCvFile() == null)
            throw new RuntimeException("Aucun CV pour ce candidat");

        try (PDDocument pdf = PDDocument.load(new ByteArrayInputStream(c.getCvFile()))) {
            String text = new PDFTextStripper().getText(pdf);
            String result = aiService.scoreCv(text, jobDescription);

            String digits = result.replaceAll("[^0-9]", "");
            int score = digits.isEmpty() ? 0 : Math.min(100, Integer.parseInt(digits));

            Evaluation eval = evalRepo.findByCandidateAndOffer(c, o)
                    .orElse(Evaluation.builder().candidate(c).offer(o).build());
            eval.setScore(score);
            evalRepo.save(eval);

            return score;
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'analyse CV", e);
        }
    }
}
