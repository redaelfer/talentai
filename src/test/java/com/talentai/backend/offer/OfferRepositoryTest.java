package com.talentai.backend.offer;

import com.talentai.backend.Offer;
import com.talentai.backend.OfferRepository;
import com.talentai.backend.rh.Rh;
import com.talentai.backend.rh.RhRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
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

        Offer o1 = Offer.builder().title("Dev 1").rh(rh).build();
        Offer o2 = Offer.builder().title("Dev 2").rh(rh).build();
        offerRepository.save(o1);
        offerRepository.save(o2);

        List<Offer> results = offerRepository.findByRhId(rh.getId());

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getRh().getId()).isEqualTo(rh.getId());
    }
}