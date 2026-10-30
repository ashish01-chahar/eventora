package com.eventora.entity;

public enum Role {
    ROLE_STUDENT,
    ROLE_ADMIN;

    public String getRoleName() {
        return name().replace("ROLE_", "").toLowerCase();
    }

    public static Role fromString(String roleStr) {
        if (roleStr == null) {
            return ROLE_STUDENT;
        }
        String normalized = roleStr.trim().toUpperCase();
        if (normalized.equals("ADMIN") || normalized.equals("ROLE_ADMIN")) {
            return ROLE_ADMIN;
        }
        return ROLE_STUDENT;
    }
}
