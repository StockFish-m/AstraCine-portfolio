package com.astracine.backend.service;

import com.astracine.backend.dto.ChangePasswordRequest;
import com.astracine.backend.dto.UpdateProfileRequest;
import com.astracine.backend.dto.UserProfileResponse;

public interface UserService {

    /**
     * Lấy thông tin profile của user hiện tại
     */
    UserProfileResponse getProfile(Long userId);

    /**
     * Cập nhật thông tin profile của user
     */
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    /**
     * Thay đổi mật khẩu
     */
    void changePassword(Long userId, ChangePasswordRequest request);
}
