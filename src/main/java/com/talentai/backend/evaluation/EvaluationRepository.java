package com.talentai.backend.evaluation;

import com.talentai.backend.candidate.Candidate;
import com.talentai.backend.offer.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByCandidateAndOffer(Candidate candidate, Offer offer);
    List<Evaluation> findByOffer(Offer offer);
    List<Evaluation> findByCandidate(Candidate candidate);
    List<Evaluation> findByOfferId(Long offerId);
    List<Evaluation> findByCandidateId(Long candidateId);
    boolean existsByCandidateIdAndOfferId(Long candidateId, Long offerId);
}
