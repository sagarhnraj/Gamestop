package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.VoiceAssistantRequestDto;
import com.sg.gamestopbackend.dto.VoiceAssistantResponseDto;

public interface VoiceAssistantService {

    VoiceAssistantResponseDto processVoiceQuery(VoiceAssistantRequestDto requestDto);
}
