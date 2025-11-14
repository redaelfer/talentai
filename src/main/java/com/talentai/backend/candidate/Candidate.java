package com.talentai.backend.candidate;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "candidates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    /** Fichier CV stocké dans la base (PDF binaire) */
    @Lob
    private byte[] cvFile;

    private String cvFileName;
    private String cvContentType;
    private Integer score;

}
