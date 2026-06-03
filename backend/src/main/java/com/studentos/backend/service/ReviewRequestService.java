package com.studentos.backend.service;

import com.studentos.backend.dto.ReviewRequestSubmit;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.ReviewRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ReviewRequestRepository;
import com.studentos.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@SuppressWarnings("null")
public class ReviewRequestService {

    private final ReviewRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ReviewRequestService(ReviewRequestRepository requestRepository, 
                                UserRepository userRepository,
                                ActivityService activityService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    public List<ReviewRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    public ReviewRequest createRequest(ReviewRequestSubmit request) {
        User user = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getRequesterId()));

        ReviewRequest reviewRequest = ReviewRequest.builder()
                .courseCode(request.getCourseCode())
                .professor(request.getProfessor())
                .requester(user)
                .anonymous(request.isAnonymous())
                .build();

        ReviewRequest savedRequest = requestRepository.save(reviewRequest);

        activityService.logActivity(
            request.getRequesterId(),
            "Review Requested",
            "You requested a review for " + request.getCourseCode() + ".",
            "reviews",
            "info"
        );

        return savedRequest;
    }

    public ReviewRequest updateRequest(Long id, ReviewRequestSubmit request) {
        ReviewRequest reviewRequest = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review request not found with ID: " + id));

        User user = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getRequesterId()));

        if (!reviewRequest.getRequester().getId().equals(request.getRequesterId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to update this review request.");
        }

        reviewRequest.setCourseCode(request.getCourseCode());
        reviewRequest.setProfessor(request.getProfessor());
        reviewRequest.setAnonymous(request.isAnonymous());

        return requestRepository.save(reviewRequest);
    }

    public void deleteRequest(Long id, Long userId) {
        ReviewRequest reviewRequest = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review request not found with ID: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!reviewRequest.getRequester().getId().equals(userId) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to delete this review request.");
        }

        requestRepository.deleteById(id);
    }
}
