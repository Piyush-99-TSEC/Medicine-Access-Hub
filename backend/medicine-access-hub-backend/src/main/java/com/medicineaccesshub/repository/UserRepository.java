package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIsDeletedFalse(String email);

    List<User> findByRole(Role role);

    List<User> findByIsDeletedFalse();
}
