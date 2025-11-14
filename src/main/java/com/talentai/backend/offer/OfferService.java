package com.talentai.backend.offer;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferService {
    private final OfferRepository repo;

    public OfferService(OfferRepository repo) {
        this.repo = repo;
    }

    public List<Offer> findAll() { return repo.findAll(); }
    public Offer findById(Long id) { return repo.findById(id).orElseThrow(); }

    public Offer create(OfferRequest req) {
        Offer o = Offer.builder()
                .title(req.title())
                .description(req.description())
                .skills(req.skills())
                .build();
        return repo.save(o);
    }

    public Offer update(Long id, OfferRequest req) {
        Offer o = findById(id);
        o.setTitle(req.title());
        o.setDescription(req.description());
        o.setSkills(req.skills());
        return repo.save(o);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
