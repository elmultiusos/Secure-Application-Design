package com.secureApp.Web.service;

import com.secureApp.Web.model.User;
import com.secureApp.Web.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            return "El usuario ya existe";
        }

        String hashedPassword = passwordEncoder.encode(password);
        userRepository.save(new User(username, hashedPassword));
        return "Usuario registrado correctamente";
    }

    public String login(String username, String password) {
        return userRepository.findByUsername(username)
                .map(user -> passwordEncoder.matches(password, user.getPassword())
                ? "Login exitoso"
                : "Credenciales inválidas")
                .orElse("Usuario no encontrado");
    }
}
