package com.talentai.backend.offer;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.talentai.backend.rh.Rh;
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
    private String skills;

    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    private String duree;
    private String remuneration;
    private String experience;
    private String typeContrat;
    @ManyToOne
    @JoinColumn(name = "rh_id")
    private Rh rh;
}
