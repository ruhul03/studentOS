package com.studentos.backend.controller;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ResourceRepository;
import com.studentos.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ResourceControllerTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ResourceController resourceController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetAllResources() {
        User uploader = new User();
        uploader.setId(1L);
        uploader.setName("Test Student");

        Resource r1 = Resource.builder()
                .id(1L)
                .title("Midterm Notes")
                .description("CSE 2118 full notes")
                .courseCode("CSE 2118")
                .type("PDF")
                .uploader(uploader)
                .upvotes(5)
                .uploadedAt(LocalDateTime.now())
                .build();

        Mockito.when(resourceRepository.findAllByOrderByUpvotesDesc()).thenReturn(Arrays.asList(r1));

        List<Resource> response = resourceController.getAllResources(null);
        assertEquals(1, response.size());
        assertEquals("Midterm Notes", response.get(0).getTitle());
    }

    @Test
    public void testUpvoteResource() {
        Resource r1 = new Resource();
        r1.setId(1L);
        r1.setUpvotes(5);

        Mockito.when(resourceRepository.findById(1L)).thenReturn(Optional.of(r1));
        
        Resource upvotedResource = new Resource();
        upvotedResource.setId(1L);
        upvotedResource.setUpvotes(6);
        
        Mockito.when(resourceRepository.save(Mockito.any(Resource.class))).thenReturn(upvotedResource);

        ResponseEntity<Resource> response = resourceController.upvoteResource(1L);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(6, response.getBody().getUpvotes());
    }
}
