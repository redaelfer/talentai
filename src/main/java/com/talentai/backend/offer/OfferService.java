package com.talentai.backend.offer;

import com.talentai.backend.rh.Rh;
import com.talentai.backend.rh.RhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository repo;
    private final RhRepository rhRepository;

    public List<Offer> findAll() {
        return repo.findAll();
    }

    public List<Offer> getOffersByRh(Long rhId) {
        return repo.findByRhId(rhId);
    }

    public Offer findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Offre non trouvée"));
    }

    public Offer create(OfferRequest req) {
        Rh rh = null;
        if (req.rhId() != null) {
            rh = rhRepository.findById(req.rhId())
                    .orElseThrow(() -> new RuntimeException("RH non trouvé avec id: " + req.rhId()));
        }

        Offer o = Offer.builder()
                .title(req.title())
                .description(req.description())
                .skills(req.skills())
                .duree(req.duree())
                .remuneration(req.remuneration())
                .experience(req.experience())
                .typeContrat(req.typeContrat())
                .createdAt(Instant.now())
                .rh(rh)
                .build();

        return repo.save(o);
    }

    public Offer update(Long id, OfferRequest req) {
        Offer o = findById(id);

        o.setTitle(req.title());
        o.setDescription(req.description());
        o.setSkills(req.skills());
        o.setDuree(req.duree());
        o.setRemuneration(req.remuneration());
        o.setExperience(req.experience());
        o.setTypeContrat(req.typeContrat());

        return repo.save(o);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}