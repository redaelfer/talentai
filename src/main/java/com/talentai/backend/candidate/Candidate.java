package com.talentai.backend.candidate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String titre;
    private String telephone;

    // --- CORRECTION ---
    // Les champs suivants sont requis par votre CandidateController
    // pour la méthode downloadCv()

    @Lob // Large Object
    @Column(length = 1000000) // 1MB, augmentez si nécessaire
    private byte[] cvFile; // Le contenu binaire du PDF

    private String cvFileName; // Le nom du fichier (ex: "mon_cv.pdf")
    private String cvContentType; // Le type MIME (ex: "application/pdf")
}