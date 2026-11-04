package com.project.Complaint.system.config;

import com.project.Complaint.system.security.CustomUserDetailsService;
import com.project.Complaint.system.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Permit preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/ai/**").permitAll()

                        // Categories accessible to all authenticated users
                        .requestMatchers(HttpMethod.GET, "/api/admin/categories").authenticated()

                        // Notifications
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/admin/notifications/**").hasRole("ADMIN")

                        // CITIZEN endpoints
                        .requestMatchers("/api/complaints/create").hasRole("CITIZEN")
                        .requestMatchers("/api/complaints/my").hasRole("CITIZEN")
                        .requestMatchers("/api/complaints/*/reopen").hasRole("CITIZEN")
                        .requestMatchers("/api/complaints/*/feedback").hasRole("CITIZEN")

                        // OFFICER endpoints
                        .requestMatchers("/api/officer/**").hasRole("OFFICER")

                        // VENDOR endpoints
                        .requestMatchers("/api/vendor/**").hasRole("VENDOR")

                        // REPRESENTATIVE endpoints
                        .requestMatchers("/api/representative/**").hasRole("REPRESENTATIVE")

                        // Allow Officer to fetch vendors
                        .requestMatchers(HttpMethod.GET, "/api/admin/users/role/VENDOR").hasAnyRole("ADMIN", "OFFICER")

                        // ADMIN endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Contracts & complaint details
                        .requestMatchers("/api/contracts/**").authenticated()
                        .requestMatchers("/api/complaints/**").authenticated()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
