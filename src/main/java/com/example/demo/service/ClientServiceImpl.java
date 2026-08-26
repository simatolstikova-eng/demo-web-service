package com.example.demo.service;

import com.example.demo.dto.ClientDto;
import com.example.demo.entity.Client;
import com.example.demo.entity.Role;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ClientRepository;
import com.example.demo.validator.ClientValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientValidator clientValidator;

    @Override
    public ClientDto createClient(ClientDto clientDto) {
        clientValidator.validateForCreate(clientDto);

        Client client = Client.builder()
                .username(clientDto.getUsername())
                .email(clientDto.getEmail())
                .password(passwordEncoder.encode("default123"))
                .fullName(clientDto.getFullName())
                .phone(clientDto.getPhone())
                .role(Role.ROLE_USER)
                .isActive(true)
                .build();

        Client savedClient = clientRepository.save(client);
        log.info("Клиент создан с id: {}", savedClient.getId());
        return mapToDto(savedClient);
    }

    @Override
    public ClientDto updateClient(Long id, ClientDto clientDto) {
        Client existingClient = getClientEntity(id);
        clientValidator.validateForUpdate(clientDto, existingClient);

        existingClient.setFullName(clientDto.getFullName());
        existingClient.setPhone(clientDto.getPhone());
        if (clientDto.getEmail() != null && !clientDto.getEmail().equals(existingClient.getEmail())) {
            existingClient.setEmail(clientDto.getEmail());
        }

        Client updatedClient = clientRepository.save(existingClient);
        log.info("Клиент обновлен с id: {}", updatedClient.getId());
        return mapToDto(updatedClient);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDto getClientById(Long id) {
        Client client = getClientEntity(id);
        return mapToDto(client);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDto getClientByUsername(String username) {
        Client client = clientRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Клиент не найден с именем: " + username));
        return mapToDto(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteClient(Long id) {
        Client client = getClientEntity(id);
        client.setActive(false);
        clientRepository.save(client);
        log.info("Клиент деактивирован с id: {}", id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return clientRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Client getClientEntity(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Клиент не найден с id: " + id));
    }

    private ClientDto mapToDto(Client client) {
        return ClientDto.builder()
                .id(client.getId())
                .username(client.getUsername())
                .email(client.getEmail())
                .fullName(client.getFullName())
                .phone(client.getPhone())
                .role(client.getRole().name())
                .active(client.isActive())
                .build();
    }
}