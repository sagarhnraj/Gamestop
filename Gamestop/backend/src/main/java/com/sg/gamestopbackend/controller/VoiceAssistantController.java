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

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import com.sg.gamestopbackend.dto.VoiceSuggestionDto;

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

    @GetMapping("/suggestions")
    public ResponseEntity<List<VoiceSuggestionDto>> getVoiceSuggestions() {
        List<VoiceSuggestionDto> suggestions = voiceAssistantService.getDynamicSuggestions();
        return ResponseEntity.ok(suggestions);
    }
}
