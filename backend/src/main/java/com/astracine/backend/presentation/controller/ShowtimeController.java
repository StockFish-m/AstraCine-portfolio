package com.astracine.backend.presentation.controller;

import com.astracine.backend.core.entity.Showtime;
import com.astracine.backend.core.service.ShowtimeService;
import com.astracine.backend.presentation.dto.ShowtimeDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    /**
     * Tạo suất chiếu mới
     * POST /api/showtimes
     */
    @PostMapping
    // Sử dụng ShowtimeDTO.CreateRequest
    public ResponseEntity<Showtime> createShowtime(@Valid @RequestBody ShowtimeDTO.CreateRequest request) {
        Showtime showtime = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(showtime);
    }

    /**
     * Lấy sơ đồ ghế để bán vé
     * GET /api/showtimes/{id}/seats
     * Trả về: ShowtimeDTO.SeatMapResponse (cấu trúc lồng nhau)
     */
    @GetMapping("/{id}/seats")
    public ResponseEntity<ShowtimeDTO.SeatMapResponse> getSeatMap(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeService.getSeatMap(id));
    }

    @GetMapping
    // Sửa List<Showtime> thành List<ShowtimeDTO.Response>
    public ResponseEntity<List<ShowtimeDTO.Response>> getAllShowtimes() {
        return ResponseEntity.ok(showtimeService.getAllShowtimes());
    }
}