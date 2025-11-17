package com.talentai.backend.auth;

import com.talentai.backend.user.Role;
import com.talentai.backend.user.User;
import com.talentai.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional; // <--- AJOUT IMPORTANT

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    // Pas de PasswordEncoder, comme vous l'avez demandé

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // S'assurer que le rôle n'est pas nul
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_CANDIDAT); // Définit un rôle par défaut
        }

        // ⚠️ ATTENTION: Le mot de passe est enregistré en clair (non crypté)
        User savedUser = userRepository.save(user);

        // On renvoie le DTO LoginResponse
        LoginResponse response = new LoginResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginDetails) {

        // --- VOTRE CORRECTION (C'est correct) ---
        Optional<User> userOptional = userRepository.findByUsername(loginDetails.getUsername());

        // --- NOUVELLE VÉRIFICATION CORRIGÉE ---

        // 1. Vérifier si l'Optional est vide (l'utilisateur n'existe pas)
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // 2. Si l'utilisateur existe, on le récupère de l'Optional
        User user = userOptional.get();

        // 3. On vérifie le mot de passe (en clair, comme demandé)
        // (La ligne `if (user == null ...)` est remplacée par ces deux vérifications)
        if (!loginDetails.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // Si tout est bon, on crée la réponse DTO
        LoginResponse response = new LoginResponse(
                user.getId(),       // Jackson va transformer cela en "userId"
                user.getUsername(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}