package com.sg.gamestopbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sg.gamestopbackend.dto.VoiceAssistantRequestDto;
import com.sg.gamestopbackend.dto.VoiceAssistantResponseDto;
import com.sg.gamestopbackend.service.VoiceAssistantService;

@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
public class VoiceAssistantController {

    private final VoiceAssistantService voiceAssistantService;

    public VoiceAssistantController(VoiceAssistantService voiceAssistantService) {
        this.voiceAssistantService = voiceAssistantService;
    }

    @PostMapping("/assistant")
    public ResponseEntity<VoiceAssistantResponseDto> processVoiceQuery(
            @RequestBody VoiceAssistantRequestDto requestDto) {

        VoiceAssistantResponseDto response = voiceAssistantService.processVoiceQuery(requestDto);
        return ResponseEntity.ok(response);
    }
}
