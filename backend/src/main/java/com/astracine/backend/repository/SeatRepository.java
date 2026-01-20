package com.astracine.backend.repository;

import com.astracine.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomId(Long roomId);
}
