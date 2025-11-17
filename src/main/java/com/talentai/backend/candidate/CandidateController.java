package com.talentai.backend.candidate;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*") // Note : "*" est ok pour le dev, mais à changer pour la prod
public class CandidateController {

    private final CandidateService service;

    public CandidateController(CandidateService service) {
        this.service = service;
    }

    @GetMapping
    public List<Candidate> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    public Candidate one(@PathVariable Long id) {
        return service.one(id);
    }

    @PostMapping
    public ResponseEntity<Candidate> create(@Valid @RequestBody CandidateRequest req) {
        Candidate c = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    @PostMapping("/{id}/cv")
    public ResponseEntity<Candidate> uploadCv(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".pdf")) {
            return ResponseEntity.badRequest().build();
        }

        Candidate updated = service.uploadCv(id, file);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long id) {
        Candidate c = service.one(id);
        byte[] data = c.getCvFile();

        if (data == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(c.getCvContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + c.getCvFileName() + "\"")
                .body(data);
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<Integer> evaluate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) throws IOException {

        String description = (String) body.get("jobDescription");
        Long offerId = Long.valueOf(body.get("offerId").toString());

        int score = service.evaluateCv(id, description, offerId);
        return ResponseEntity.ok(score);
    }


    /**
     * Gère la mise à jour des informations textuelles du profil candidat.
     * Appelé par le frontend depuis CandidateProfile.js
     */
    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CandidateRequest req) {

        Candidate updatedCandidate = service.updateCandidate(id, req);
        return ResponseEntity.ok(updatedCandidate);
    }

}