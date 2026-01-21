package com.astracine.backend.service;

import com.astracine.backend.dto.ComboDTO;
import com.astracine.backend.entity.Combo;
import com.astracine.backend.repository.ComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComboService {
    private final ComboRepository comboRepository;

    //Lấy danh sách tất cả (của Admin)
    public List<Combo> getAllCombos() {
        return comboRepository.findAll();
    }
    //Lấy danh sách combo đang bán (Cho nhân viên bán hàng)
    public List<Combo> getActiveCombos() {
        return comboRepository.findByStatus("ACTIVE");
    }
    // Lấy chi tiết 1 combo
    public Combo getComboById(Long id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Combo với ID: " + id));
    }
    // Tạo mới
    public Combo createCombo(ComboDTO dto) {
        Combo combo = new Combo();
        combo.setName(dto.getName());
        combo.setPrice(dto.getPrice());
        combo.setStatus(dto.getStatus());
        return comboRepository.save(combo);
    }
    // Cập nhật
    public Combo updateCombo(Long id, ComboDTO dto) {
        Combo existingCombo = getComboById(id);
        existingCombo.setName(dto.getName());
        existingCombo.setPrice(dto.getPrice());
        // Chỉ cập nhật status nếu user có gửi lên, nếu không giữ nguyên
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            existingCombo.setStatus(dto.getStatus());
        }
        return comboRepository.save(existingCombo);
    }
    // 6. Xóa (Soft Delete)
    // Nếu xóa cứng (deleteById) sẽ lỗi nếu combo này đã từng được bán trong Invoice cũ.
    public void deleteCombo(Long id) {
        Combo existingCombo = getComboById(id);
        existingCombo.setStatus("INACTIVE");
        comboRepository.save(existingCombo);
    }
}
