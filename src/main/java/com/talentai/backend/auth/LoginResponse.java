package com.talentai.backend.auth;

import com.talentai.backend.user.Role;

/**
 * C'est notre objet DTO (Data Transfer Object) pour la réponse de connexion.
 * Il contient les champs exacts attendus par le frontend : userId, username, et role.
 * J'utilise un "record" Java (disponible depuis Java 16) pour la concision.
 */
public record LoginResponse(
        Long userId,
        String username,
        Role role
) {
}

/*
 * --- ALTERNATIVE (SI VOUS UTILISEZ JAVA AVANT LA VERSION 16) ---
 * Si 'public record' donne une erreur, commentez-le et utilisez
 * cette classe à la place :
 */

/*
package com.talentai.backend.auth;

import com.talentai.backend.user.Role;

public class LoginResponse {
    private Long userId;
    private String username;
    private Role role;

    public LoginResponse(Long userId, String username, Role role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    // Getters
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public Role getRole() { return role; }

    // Setters
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(Role role) { this.role = role; }
}
*/