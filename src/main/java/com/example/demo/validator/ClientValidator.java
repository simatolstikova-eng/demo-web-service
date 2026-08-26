package com.example.demo.validator;

import com.example.demo.dto.ClientDto;
import com.example.demo.entity.Client;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class ClientValidator {

    private final ClientService clientService;

    public void validateForCreate(ClientDto clientDto) {
        if (clientDto == null) {
            throw new IllegalArgumentException("Данные клиента не могут быть пустыми");
        }

        if (!StringUtils.hasText(clientDto.getUsername())) {
            throw new IllegalArgumentException("Имя пользователя обязательно");
        }

        if (!StringUtils.hasText(clientDto.getEmail())) {
            throw new IllegalArgumentException("Email обязателен");
        }

        if (clientService.existsByUsername(clientDto.getUsername())) {
            throw new DuplicateResourceException("Имя пользователя уже существует: " + clientDto.getUsername());
        }

        if (clientService.existsByEmail(clientDto.getEmail())) {
            throw new DuplicateResourceException("Email уже существует: " + clientDto.getEmail());
        }
    }

    public void validateForUpdate(ClientDto clientDto, Client existingClient) {
        if (clientDto == null) {
            throw new IllegalArgumentException("Данные клиента не могут быть пустыми");
        }

        if (clientDto.getEmail() != null &&
            !clientDto.getEmail().equals(existingClient.getEmail()) &&
            clientService.existsByEmail(clientDto.getEmail())) {
            throw new DuplicateResourceException("Email уже существует: " + clientDto.getEmail());
        }
    }
}