package com.studentos.backend.config;

import com.studentos.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(jwt)) {
                    username = jwtUtil.extractUsername(jwt);
                }
            } catch (Exception e) {
                logger.error("Failed to parse JWT", e);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
            String authRole = "ROLE_" + (role != null ? role.toUpperCase() : "STUDENT");

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, Collections.singletonList(new SimpleGrantedAuthority(authRole)));
            
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
