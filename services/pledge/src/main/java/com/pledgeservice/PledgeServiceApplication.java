package com.pledgeservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableScheduling
@EnableRetry
public class PledgeServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PledgeServiceApplication.class, args);
    }
}