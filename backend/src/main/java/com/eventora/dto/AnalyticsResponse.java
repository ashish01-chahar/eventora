package com.eventora.dto;

import java.util.Map;

public class AnalyticsResponse {

    private long totalEvents;
    private long totalRegistrations;
    private int attendanceRate; // percentage 0-100
    private String averageRating; // formatted to 1 decimal place, e.g. "4.5"
    private Map<String, Long> popularity; // eventTitle -> registrationCount
    private Map<String, Long> categoryCounts; // category -> eventCount

    public AnalyticsResponse() {}

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getTotalRegistrations() { return totalRegistrations; }
    public void setTotalRegistrations(long totalRegistrations) { this.totalRegistrations = totalRegistrations; }

    public int getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(int attendanceRate) { this.attendanceRate = attendanceRate; }

    public String getAverageRating() { return averageRating; }
    public void setAverageRating(String averageRating) { this.averageRating = averageRating; }

    public Map<String, Long> getPopularity() { return popularity; }
    public void setPopularity(Map<String, Long> popularity) { this.popularity = popularity; }

    public Map<String, Long> getCategoryCounts() { return categoryCounts; }
    public void setCategoryCounts(Map<String, Long> categoryCounts) { this.categoryCounts = categoryCounts; }
}
