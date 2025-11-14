package com.talentai.backend.offer;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferService service;

    public OfferController(OfferService service) {
        this.service = service;
    }

    @GetMapping
    public List<Offer> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public Offer one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<Offer> create(@Valid @RequestBody OfferRequest req) {
        Offer saved = service.create(req);
        return ResponseEntity.created(URI.create("/api/offers/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public Offer update(@PathVariable Long id, @Valid @RequestBody OfferRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
