package com.talentai.backend.offer;

import jakarta.validation.constraints.NotBlank;

public record OfferRequest(
        @NotBlank String title,
        String description,
        String skills,
        String duree,
        String remuneration,
        String experience,
        String typeContrat,
        Long rhId
) {}