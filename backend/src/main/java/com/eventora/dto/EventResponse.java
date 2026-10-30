package com.eventora.dto;

public class EventResponse {

    private String id;
    private String title;
    private String category;
    private String date; // YYYY-MM-DD
    private String time;
    private String venue;
    private Integer capacity;
    private String description;
    private String createdBy;
    private long registeredCount;
    private boolean alreadyRegistered;

    public EventResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public long getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(long registeredCount) { this.registeredCount = registeredCount; }

    public boolean isAlreadyRegistered() { return alreadyRegistered; }
    public void setAlreadyRegistered(boolean alreadyRegistered) { this.alreadyRegistered = alreadyRegistered; }
}
