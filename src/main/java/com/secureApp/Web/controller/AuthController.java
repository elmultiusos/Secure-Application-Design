package com.secureApp.Web.controller;

import com.secureApp.Web.model.User;
import com.secureApp.Web.repository.UserRepository;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body("Usuario y contraseña son requeridos");
        }
        if (userRepo.findByUsername(username).isPresent()) {
            return ResponseEntity.status(409).body("El usuario ya existe");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        userRepo.save(user);
        return ResponseEntity.ok("Usuario registrado exitosamente");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Credenciales requeridas");
        }
        return userRepo.findByUsername(username)
                .filter(u -> encoder.matches(password, u.getPassword()))
                .map(u -> ResponseEntity.ok("Login exitoso. Bienvenido, " + u.getUsername() + "!"))
                .orElse(ResponseEntity.status(401).body("Credenciales inválidas"));
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("API segura activa. Conexión TLS verificada.");
    }
}

// Protected endpoint — requires HTTP Basic authentication (any registered user)
@RestController
@RequestMapping("/api")
class SecureController {

    @GetMapping("/hello")
    public ResponseEntity<String> hello(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok("Hola, " + user.getUsername() + "! Estás autenticado en la zona segura.");
    }
}
