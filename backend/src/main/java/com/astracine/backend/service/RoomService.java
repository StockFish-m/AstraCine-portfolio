package com.astracine.backend.service;

import com.astracine.backend.entity.Room;
import com.astracine.backend.entity.Seat;
import com.astracine.backend.repository.RoomRepository;
import com.astracine.backend.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    // Logic quan trọng: Tạo phòng và tự động sinh ghế
    @Transactional // Đảm bảo nếu sinh ghế lỗi thì không lưu phòng
    public Room createRoomWithSeats(Room roomRequest) {
        // 1. Lưu thông tin phòng trước
        Room newRoom = new Room();
        newRoom.setName(roomRequest.getName());
        newRoom.setTotalRows(roomRequest.getTotalRows());
        newRoom.setTotalColumns(roomRequest.getTotalColumns());
        newRoom.setStatus("ACTIVE");
        
        Room savedRoom = roomRepository.save(newRoom);

        // 2. Logic sinh ghế tự động (Matrix Generation)
        List<Seat> seats = new ArrayList<>();
        
        // Loop qua số hàng (Ví dụ 10 hàng -> i chạy từ 0 đến 9)
        for (int i = 0; i < savedRoom.getTotalRows(); i++) {
            // Chuyển đổi số thành chữ cái: 0 -> A, 1 -> B, 2 -> C...
            String rowLabel = String.valueOf((char)('A' + i));
            
            // Loop qua số cột (Ví dụ 12 ghế/hàng)
            for (int j = 1; j <= savedRoom.getTotalColumns(); j++) {
                Seat seat = new Seat();
                seat.setRoom(savedRoom);
                seat.setRowLabel(rowLabel);
                seat.setColumnNumber(j);
                seat.setSeatType("NORMAL"); // Mặc định là ghế thường
                
                seats.add(seat);
            }
        }
        
        // 3. Lưu danh sách ghế vào DB (Batch Insert)
        seatRepository.saveAll(seats);

        return savedRoom;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
}
