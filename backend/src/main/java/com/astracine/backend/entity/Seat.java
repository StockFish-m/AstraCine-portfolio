package com.astracine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"room_id", "row_label", "column_number"})
})
@Data
@NoArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "row_label", nullable = false, length = 5)
    private String rowLabel;

    @Column(name = "column_number", nullable = false)
    private Integer columnNumber;

    @Column(name = "seat_type", length = 20)
    private String seatType = "NORMAL";
}
