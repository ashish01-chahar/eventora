package com.eventora.controller;

import com.eventora.dto.AuthRequest;
import com.eventora.dto.RegistrationRequest;
import com.eventora.dto.StudentCreateRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin@eventora.com", roles = {"ADMIN"})
    void testAdminCreatesStudentSuccess() throws Exception {
        StudentCreateRequest req = new StudentCreateRequest(
                "Jane Doe",
                "jane.doe@college.edu",
                "ENR2026CS501",
                "Computer Science",
                "2nd Year",
                "SecurePass123"
        );

        mockMvc.perform(post("/api/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane.doe@college.edu"))
                .andExpect(jsonPath("$.enrollmentNumber").value("ENR2026CS501"))
                .andExpect(jsonPath("$.temporaryPassword").value("SecurePass123"))
                .andExpect(jsonPath("$.role").value("student"));
    }

    @Test
    @WithMockUser(username = "student@eventora.com", roles = {"STUDENT"})
    void testStudentCannotCreateStudentForbidden() throws Exception {
        StudentCreateRequest req = new StudentCreateRequest(
                "Another Student",
                "another@college.edu",
                "ENR2026CS502",
                "Information Technology",
                "1st Year",
                "Pass123"
        );

        mockMvc.perform(post("/api/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@eventora.com", roles = {"ADMIN"})
    void testDuplicateEmailReturnsBadRequest() throws Exception {
        // student@eventora.com is already seeded
        StudentCreateRequest req = new StudentCreateRequest(
                "Duplicate Email Student",
                "student@eventora.com",
                "ENR2026CS503",
                "Mechanical",
                "1st Year",
                "Pass123"
        );

        mockMvc.perform(post("/api/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("email address already exists")));
    }

    @Test
    @WithMockUser(username = "admin@eventora.com", roles = {"ADMIN"})
    void testDuplicateEnrollmentReturnsBadRequest() throws Exception {
        StudentCreateRequest first = new StudentCreateRequest(
                "First Student",
                "first@college.edu",
                "ENR2026UNIQ",
                "Civil",
                "3rd Year",
                "Pass123"
        );
        mockMvc.perform(post("/api/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        StudentCreateRequest second = new StudentCreateRequest(
                "Second Student",
                "second@college.edu",
                "ENR2026UNIQ", // Duplicate enrollment
                "Civil",
                "3rd Year",
                "Pass123"
        );
        mockMvc.perform(post("/api/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("enrollment number already exists")));
    }

    @Test
    void testCompleteLifecycleAdminCreatesStudentAndStudentLogsInAndRegisters() throws Exception {
        // 1. Admin creates student
        StudentCreateRequest createReq = new StudentCreateRequest(
                "Maya Lin",
                "maya.lin@college.edu",
                "ENR2026CS888",
                "Computer Science",
                "3rd Year",
                "MayaSecret2026"
        );

        mockMvc.perform(post("/api/admin/students")
                        .with(user("admin@eventora.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("maya.lin@college.edu"))
                .andExpect(jsonPath("$.temporaryPassword").value("MayaSecret2026"));

        // 2. Student logs in with the created credentials
        AuthRequest loginReq = new AuthRequest("maya.lin@college.edu", "MayaSecret2026", "student");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("student"))
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginJson.get("token").asText();

        // 3. Newly created student registers for an event using their token
        RegistrationRequest regReq = new RegistrationRequest("EVT-101");
        mockMvc.perform(post("/api/registrations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").value("EVT-101"))
                .andExpect(jsonPath("$.studentEmail").value("maya.lin@college.edu"))
                .andExpect(jsonPath("$.studentName").value("Maya Lin"));
    }
}
