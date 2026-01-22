package com.astracine.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String name; // ADMIN, STAFF, MANAGER, CUSTOMER

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();
}
