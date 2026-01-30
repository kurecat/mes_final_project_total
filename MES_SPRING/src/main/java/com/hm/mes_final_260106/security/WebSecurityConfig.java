package com.hm.mes_final_260106.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final TokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth

                        // 1. 로그인/회원가입 등 인증 관련 API 허용
                        .requestMatchers("/auth/login", "/auth/signup", "/auth/refresh").permitAll()

                        // ★ [핵심 수정] MES 관련 모든 API 요청을 일단 허용 (개발 중 401 에러 방지)
                        .requestMatchers("/api/mes/**").permitAll()

                        /* * 아래의 엄격한 제한 코드는 주석 처리하거나, 위 줄(permitAll) 덕분에
                         * 자동으로 무시됩니다. (순서상 위에 있는 설정이 먼저 적용됨)
                         * * // 관리자 전용
                         * .requestMatchers(1
                         * "/api/mes/material/in",
                         * "/api/mes/material/out",
                         * "/api/mes/order/**"
                         * ).hasAuthority("ROLE_ADMIN")
                         * * // 조회 (로그인만)
                         * .requestMatchers(
                         * "/api/mes/material/inventory",
                         * "/api/mes/material-tx/**"
                         * ).authenticated()
                         */

                        .anyRequest().authenticated()
                )

                .with(new JwtSecurityConfig(tokenProvider), Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 인증 정보(토큰) 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }
}