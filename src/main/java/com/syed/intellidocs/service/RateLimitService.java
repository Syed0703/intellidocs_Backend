package com.syed.intellidocs.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<Long, Bucket> askBuckets =
            new ConcurrentHashMap<>();

    public boolean allowAskRequest(Long userId) {

        Bucket bucket = askBuckets.computeIfAbsent(
                userId,
                id -> createAskBucket()
        );

        return bucket.tryConsume(1);
    }

    private Bucket createAskBucket() {

        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(
                        10,
                        Duration.ofMinutes(1)
                )
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
