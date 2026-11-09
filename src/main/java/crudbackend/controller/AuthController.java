package crudbackend.controller;

import crudbackend.security.JwtService;
import crudbackend.entity.Usuario;
import crudbackend.repository.UsuarioRepository;
import crudbackend.repository.RolRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authManager,
            JwtService jwtService,
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {

        this.authManager = authManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> datos) {

        String username = datos.get("username");
        String password = datos.get("password");

        var autenticacion = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        String rol = autenticacion.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        String token = jwtService.generarToken(username, rol);

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> datos) {

        String username = datos.get("username");
        String password = datos.get("password");

        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "Completa todos los campos"));
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "El nombre de usuario ya existe"));
        }

        var rol = rolRepository.findByNombre("USER");

        if (rol.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "No se encontró el rol USER"));
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username.trim());
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(rol.get());

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(
                Map.of("mensaje", "Usuario registrado correctamente")
        );
    }
}
