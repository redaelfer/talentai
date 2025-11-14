package com.talentai.backend.evaluation;

import com.talentai.backend.candidate.Candidate;
import com.talentai.backend.offer.Offer;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Candidate candidate;

    @ManyToOne
    private Offer offer;

    private Integer score;
}
