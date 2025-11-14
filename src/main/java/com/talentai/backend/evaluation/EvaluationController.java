package com.talentai.backend.evaluation;

import com.talentai.backend.offer.Offer;
import com.talentai.backend.offer.OfferRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final EvaluationRepository repo;
    private final OfferRepository offerRepo;

    public EvaluationController(EvaluationRepository repo, OfferRepository offerRepo) {
        this.repo = repo;
        this.offerRepo = offerRepo;
    }

    @GetMapping("/offer/{offerId}")
    public List<Map<String, Object>> byOffer(@PathVariable Long offerId) {
        Offer o = offerRepo.findById(offerId).orElseThrow();

        return repo.findByOffer(o).stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("evaluationId", e.getId());
                    map.put("candidateId", e.getCandidate().getId());
                    map.put("candidateName", e.getCandidate().getFullName());
                    map.put("email", e.getCandidate().getEmail());
                    map.put("score", e.getScore());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
