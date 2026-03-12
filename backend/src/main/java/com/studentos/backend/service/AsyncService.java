package com.studentos.backend.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service
public class AsyncService {

    @Async
    public void processResourceBackground(String resourceName) {
        System.out.println("Starting background processing for: " + resourceName + " on thread: " + Thread.currentThread().getName());
        try {
            // Simulate heavy work
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Finished background processing for: " + resourceName);
    }
}
