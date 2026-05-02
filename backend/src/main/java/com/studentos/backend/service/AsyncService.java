package com.studentos.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AsyncService {

    @Async
    public void processResourceBackground(String resourceName) {
        log.info("Starting background processing for: {} on thread: {}", resourceName, Thread.currentThread().getName());
        try {
            // Simulate heavy work
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        log.info("Finished background processing for: {}", resourceName);
    }
}
