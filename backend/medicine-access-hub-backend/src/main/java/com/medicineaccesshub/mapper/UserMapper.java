package com.medicineaccesshub.mapper;

import com.medicineaccesshub.dto.response.UserProfileResponse;
import com.medicineaccesshub.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.fromEntity(user);
    }

    public List<UserProfileResponse> toProfileResponseList(List<User> users) {
        return users.stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }
}
