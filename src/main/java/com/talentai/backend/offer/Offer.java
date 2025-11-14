package com.talentai.backend.offer;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "offers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Column(length = 4000)
    private String description;

    /** Compétences requises, séparées par des virgules (ex: "Java,Spring,React") */
    private String skills;

    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    private String duree;         // ex: "6 mois"
    private String remuneration;  // ex: "4000 MAD/mois"
    private String experience;    // ex: "2 ans minimum"
    private String typeContrat;
}
