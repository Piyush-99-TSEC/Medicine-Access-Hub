package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.service.PythonService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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

    @Value("${python.service.ocr-timeout-ms:20000}")
    private int ocrTimeoutMs;

    private RestClient ocrClient;

    private RestClient client;

    @PostConstruct
    void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));
        client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        SimpleClientHttpRequestFactory ocrFactory = new SimpleClientHttpRequestFactory();
        ocrFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        ocrFactory.setReadTimeout(Duration.ofMillis(ocrTimeoutMs));
        ocrClient = RestClient.builder().baseUrl(baseUrl).requestFactory(ocrFactory).build();
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

    @Override
    @SuppressWarnings("unchecked")
    public Optional<Map<String, Object>> ocr(byte[] image, String filename) {
        try {
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
            // The filename is what makes FastAPI treat the part as an UploadFile
            parts.add("file", new ByteArrayResource(image) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            Map<String, Object> res = ocrClient.post().uri("/ocr")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(parts)
                    .retrieve().body(Map.class);
            return Optional.ofNullable(res);
        } catch (Exception e) {
            log.warn("Python /ocr failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<Map<String, Object>> route(double fromLat, double fromLng, double toLat, double toLng) {
        try {
            Map<String, Object> res = client.post().uri("/route")
                    .body(Map.of(
                            "origin", Map.of("lat", fromLat, "lng", fromLng),
                            "destination", Map.of("lat", toLat, "lng", toLng)))
                    .retrieve().body(Map.class);
            return Optional.ofNullable(res);
        } catch (Exception e) {
            log.warn("Python /route failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void reloadSearchIndex() {
        try {
            client.post().uri("/reload").retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.warn("Python /reload failed: {}", e.getMessage());
        }
    }
}