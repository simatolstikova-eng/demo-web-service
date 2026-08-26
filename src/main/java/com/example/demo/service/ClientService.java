package com.example.demo.service;

import com.example.demo.dto.ClientDto;
import com.example.demo.entity.Client;

import java.util.List;

public interface ClientService {
    ClientDto createClient(ClientDto clientDto);
    ClientDto updateClient(Long id, ClientDto clientDto);
    ClientDto getClientById(Long id);
    ClientDto getClientByUsername(String username);
    List<ClientDto> getAllClients();
    void deleteClient(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Client getClientEntity(Long id);
}