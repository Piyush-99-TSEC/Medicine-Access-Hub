package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.service.PythonService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class PythonServiceImpl implements PythonService {

    @Value("${python.service.url:http://localhost:8000}")
    private String baseUrl;

    @Value("${python.service.timeout-ms:3000}")
    private int timeoutMs;

    private RestClient client;

    @PostConstruct
    void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));
        client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<List<Long>> searchIds(String query) {
        try {
            List<Map<String, Object>> res = client.post().uri("/search")
                    .body(Map.of("queries", List.of(query)))
                    .retrieve().body(List.class);
            if (res == null || res.isEmpty() || !Boolean.TRUE.equals(res.get(0).get("matched"))) {
                return Optional.empty();
            }
            List<Map<String, Object>> items = (List<Map<String, Object>>) res.get(0).get("results");
            return Optional.of(items.stream().map(m -> ((Number) m.get("id")).longValue()).toList());
        } catch (Exception e) {
            log.warn("Python /search failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<List<Map<String, Object>>> rank(double lat, double lng, List<Map<String, Object>> pharmacies) {
        try {
            List<Map<String, Object>> res = client.post().uri("/rank")
                    .body(Map.of("lat", lat, "lng", lng, "pharmacies", pharmacies))
                    .retrieve().body(List.class);
            return Optional.ofNullable(res);
        } catch (Exception e) {
            log.warn("Python /rank failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}