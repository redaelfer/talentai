package com.talentai.backend.candidate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CandidateRequest(
        @NotBlank String fullName,
        @Email String email
) { }
