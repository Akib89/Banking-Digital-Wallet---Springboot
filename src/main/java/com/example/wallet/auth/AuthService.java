package com.example.wallet.auth;

import com.example.wallet.auth.dto.AuthResponse;
import com.example.wallet.auth.dto.LoginRequest;
import com.example.wallet.auth.dto.RegisterRequest;
import com.example.wallet.common.ConflictException;
import com.example.wallet.common.UnauthorizedException;
import com.example.wallet.security.JwtTokenService;
import com.example.wallet.user.User;
import com.example.wallet.user.UserRepository;
import com.example.wallet.user.UserStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User(
                request.fullName().trim(),
                email,
                passwordEncoder.encode(request.password())
        );
        userRepository.save(user);
        return response(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is not active");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return response(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                jwtTokenService.issue(user),
                "Bearer"
        );
    }
}
