package com.astracine.backend.repository;

import com.astracine.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByStatus(String status);

    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.fullName LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.status = :status ORDER BY u.createdAt DESC")
    List<User> findByStatusOrderByCreatedAtDesc(@Param("status") String status);
}

