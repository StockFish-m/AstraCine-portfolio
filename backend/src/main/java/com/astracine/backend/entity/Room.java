package com.astracine.backend.entity;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Data // Lombok getter/setter/tostring
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "total_columns", nullable = false)
    private Integer totalColumns;

    @Column(columnDefinition = "varchar(20) default 'ACTIVE'")
    private String status = "ACTIVE";
}
