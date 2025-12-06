package com.talentai.backend.offer;

import com.talentai.backend.rh.Rh;
import com.talentai.backend.rh.RhRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class OfferRepositoryTest {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private RhRepository rhRepository;

    @Test
    void shouldFindOffersByRhId() {
        Rh rh = new Rh();
        rh.setUsername("rh_test");
        rh.setEmail("rh@test.com");
        rh = rhRepository.save(rh);

        Offer o1 = new Offer();
        o1.setTitle("Dev 1");
        o1.setRh(rh);

        Offer o2 = new Offer();
        o2.setTitle("Dev 2");
        o2.setRh(rh);

        offerRepository.save(o1);
        offerRepository.save(o2);

        List<Offer> results = offerRepository.findByRhId(rh.getId());

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getRh().getId()).isEqualTo(rh.getId());
    }
}