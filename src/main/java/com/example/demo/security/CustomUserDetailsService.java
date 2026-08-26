package com.example.demo.security;

import com.example.demo.entity.Client;
import com.example.demo.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final ClientRepository clientRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Client client = clientRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с именем: " + username));

        return UserPrincipal.create(client);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с id: " + id));

        return UserPrincipal.create(client);
    }
}