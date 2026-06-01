package com.studentos.backend.controller;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.service.ResourceService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;

@SuppressWarnings("null")
public class ResourceControllerTest {

    @Mock
    private ResourceService resourceService;

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
        uploader.setUsername("test_uploader");

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

        Mockito.when(resourceService.getAllResources(null)).thenReturn(Arrays.asList(r1));

        ResponseEntity<List<Resource>> response = resourceController.getAllResources(null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Midterm Notes", response.getBody().get(0).getTitle());
    }

    @Test
    public void testUpvoteResource() {
        Resource upvotedResource = new Resource();
        upvotedResource.setId(1L);
        upvotedResource.setUpvotes(6);
        
        Mockito.when(resourceService.upvoteResource(1L)).thenReturn(upvotedResource);

        ResponseEntity<Resource> response = resourceController.upvoteResource(1L);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(6, response.getBody().getUpvotes());
    }
}
