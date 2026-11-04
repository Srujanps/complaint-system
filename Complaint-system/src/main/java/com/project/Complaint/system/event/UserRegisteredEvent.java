package com.project.Complaint.system.event;

import com.project.Complaint.system.model.User;
import org.springframework.context.ApplicationEvent;

public class UserRegisteredEvent extends ApplicationEvent {
    private final User user;
    private final boolean isFirstLogin;

    public UserRegisteredEvent(Object source, User user, boolean isFirstLogin) {
        super(source);
        this.user = user;
        this.isFirstLogin = isFirstLogin;
    }

    public User getUser() { return user; }
    public boolean isFirstLogin() { return isFirstLogin; }
}
