package com.talentai.backend.offer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentai.backend.Offer;
import com.talentai.backend.OfferController;
import com.talentai.backend.OfferRequest;
import com.talentai.backend.OfferService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OfferController.class)
class OfferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OfferService offerService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnListOfOffers() throws Exception {
        Offer o1 = Offer.builder().id(1L).title("Java Dev").build();
        Offer o2 = Offer.builder().id(2L).title("React Dev").build();

        given(offerService.findAll()).willReturn(Arrays.asList(o1, o2));

        mockMvc.perform(get("/api/offers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].title").value("Java Dev"));
    }

    @Test
    void shouldCreateOffer() throws Exception {
        OfferRequest req = new OfferRequest(
                "Lead Tech", "Desc", "Java", "CDI", "60k", "Senior", "Full", 1L
        );
        Offer saved = Offer.builder().id(5L).title("Lead Tech").build();

        given(offerService.create(req)).willReturn(saved);

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.title").value("Lead Tech"));
    }
}