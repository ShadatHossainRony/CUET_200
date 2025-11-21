package com.pledgeservice.controller;

import com.pledgeservice.dto.CreatePledgeRequest;
import com.pledgeservice.dto.PledgeDto;
import com.pledgeservice.service.PledgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/pledges")
public class PledgeController {
    
    @Autowired
    private PledgeService pledgeService;

    @PostMapping("/recurring")
    public ResponseEntity<PledgeDto> createRecurring(@RequestBody CreatePledgeRequest request) {
        PledgeDto pledge = pledgeService.createRecurring(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pledge);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PledgeDto> getPledge(@PathVariable String id) {
        PledgeDto pledge = pledgeService.getPledge(id);
        return ResponseEntity.ok(pledge);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<PledgeDto>> getUserPledgeHistory(@PathVariable String userId) {
        List<PledgeDto> pledges = pledgeService.getUserPledgeHistory(userId);
        return ResponseEntity.ok(pledges);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelPledge(@PathVariable String id) {
        pledgeService.cancelPledge(id);
        return ResponseEntity.noContent().build();
    }
}