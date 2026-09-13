package com.medicineaccesshub.security;

import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom {@link UserDetailsService} implementation backed by the {@link UserRepository}.
 * Loads user details for authentication (by email) and for the JWT filter (by id).
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public User loadUserById(Long userId) throws UsernameNotFoundException {
        return userRepository.findById(userId)
                .filter(user -> !user.getIsDeleted())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}
