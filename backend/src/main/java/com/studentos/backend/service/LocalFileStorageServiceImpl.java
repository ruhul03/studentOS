package com.studentos.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final Path storageLocation;

    public LocalFileStorageServiceImpl() {
        this.storageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) originalFileName = "unnamed";
        
        // Clean and normalize the filename to prevent directory traversal
        String cleanedFileName = Paths.get(originalFileName).getFileName().toString();
        String fileName = UUID.randomUUID().toString() + "_" + cleanedFileName;
        
        Path targetLocation = this.storageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        return "/uploads/" + fileName;
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            log.debug("Ignored delete request for non-upload URL: {}", fileUrl);
            return;
        }
        
        try {
            String fileName = fileUrl.substring("/uploads/".length());
            // Normalize and resolve to ensure we stay within the storage location
            Path filePath = this.storageLocation.resolve(Paths.get(fileName).getFileName().toString());
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Successfully deleted file: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete file at {}: {}", fileUrl, e.getMessage());
        }
    }
}
