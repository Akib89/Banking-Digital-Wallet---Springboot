package com.example.wallet.security;

import com.example.wallet.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class JwtTokenService {
    private final JwtEncoder encoder;
    private final long ttlMinutes;
    private final String issuer;

    public JwtTokenService(JwtEncoder encoder,
                           @Value("${wallet.jwt.ttl-minutes:60}") long ttlMinutes,
                           @Value("${wallet.jwt.issuer:digital-wallet-backend}") String issuer) {
        this.encoder = encoder;
        this.ttlMinutes = ttlMinutes;
        this.issuer = issuer;
    }

    public String issue(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(ttlMinutes, ChronoUnit.MINUTES))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", List.of(user.getRole().name()))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
