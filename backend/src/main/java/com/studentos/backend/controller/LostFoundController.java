package com.studentos.backend.controller;

import com.studentos.backend.dto.LostFoundRequest;
import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import com.studentos.backend.service.LostFoundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lostfound")
@SuppressWarnings("null")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    @GetMapping
    public ResponseEntity<List<LostFoundItem>> getActiveItems(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(lostFoundService.getActiveItems(type));
    }

    @PostMapping
    public ResponseEntity<LostFoundItem> reportItem(@Valid @RequestBody LostFoundRequest request, @AuthenticationPrincipal User currentUser) {
        LostFoundItem savedItem = lostFoundService.reportItem(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LostFoundItem> updateItem(@PathVariable Long id, @Valid @RequestBody LostFoundRequest request, @AuthenticationPrincipal User currentUser) {
        LostFoundItem updatedItem = lostFoundService.updateItem(id, request, currentUser);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        lostFoundService.deleteItem(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<LostFoundItem> resolveItem(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        LostFoundItem resolvedItem = lostFoundService.resolveItem(id, currentUser);
        return ResponseEntity.ok(resolvedItem);
    }
}
