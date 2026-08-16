package com.sg.gamestopbackend.service;

import java.util.List;

import com.sg.gamestopbackend.dto.VoiceAssistantRequestDto;
import com.sg.gamestopbackend.dto.VoiceAssistantResponseDto;
import com.sg.gamestopbackend.dto.VoiceSuggestionDto;

public interface VoiceAssistantService {

    VoiceAssistantResponseDto processVoiceQuery(VoiceAssistantRequestDto requestDto);

    List<VoiceSuggestionDto> getDynamicSuggestions();
}

