package com.talentai.backend.auth;

import com.talentai.backend.user.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        User user = new User();
        user.setUsername(req.get("username"));
        user.setEmail(req.get("email"));
        user.setPassword(req.get("password")); // pas de cryptage pour le moment
        user.setRole(Role.valueOf(req.getOrDefault("role", "ROLE_CANDIDAT")));
        userRepo.save(user);
        return ResponseEntity.ok("Utilisateur créé !");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        User user = userRepo.findByUsername(req.get("username"))
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!user.getPassword().equals(req.get("password"))) {
            return ResponseEntity.badRequest().body("Mot de passe incorrect");
        }
        return ResponseEntity.ok(Map.of(
                "message", "Connexion réussie",
                "role", user.getRole().toString(),
                "username", user.getUsername()
        ));
    }
}
