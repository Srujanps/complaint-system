package com.project.Complaint.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@ComponentScan(basePackages = {"com.project.Complaint.system", "com.grievance.ai"})
@SpringBootApplication
public class ComplaintSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ComplaintSystemApplication.class, args);
	}

}
