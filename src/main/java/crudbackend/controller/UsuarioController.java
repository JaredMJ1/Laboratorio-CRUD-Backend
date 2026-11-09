package crudbackend.controller;

import crudbackend.entity.Usuario;
import crudbackend.repository.UsuarioRepository;
import crudbackend.repository.RolRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @GetMapping
    public List<Map<String, Object>> listar() {
        return usuarioRepository.findAll().stream()
                .map(usuario -> Map.<String, Object>of(
                        "id", usuario.getId(),
                        "username", usuario.getUsername(),
                        "rol", usuario.getRol().getNombre()
                ))
                .toList();
    }


    @GetMapping("/roles")
    public List<Map<String, Object>> listarRoles() {
        return rolRepository.findAll().stream()
                .map(rol -> Map.<String, Object>of(
                        "id", rol.getId(),
                        "nombre", rol.getNombre()
                ))
                .toList();
    }


    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> datos) {

        String username = datos.get("username");
        String password = datos.get("password");
        String nombreRol = datos.get("rol");

        if (username == null || username.isBlank()
                || password == null || password.isBlank()
                || nombreRol == null || nombreRol.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "Todos los campos son obligatorios"));
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "El usuario ya existe"));
        }

        var rol = rolRepository.findByNombre(nombreRol);

        if (rol.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "El rol no existe"));
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(rol.get());

        Usuario guardado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
                "id", guardado.getId(),
                "username", guardado.getUsername(),
                "rol", guardado.getRol().getNombre()
        ));
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {

        var encontrado = usuarioRepository.findById(id);

        if (encontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = encontrado.get();

        String username = datos.get("username");
        String password = datos.get("password");
        String nombreRol = datos.get("rol");

        if (username != null && !username.isBlank()) {
            var otroUsuario = usuarioRepository.findByUsername(username);

            if (otroUsuario.isPresent()
                    && !otroUsuario.get().getId().equals(id)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("mensaje", "El nombre de usuario ya existe"));
            }

            usuario.setUsername(username);
        }

        if (password != null && !password.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }

        if (nombreRol != null && !nombreRol.isBlank()) {
            var rol = rolRepository.findByNombre(nombreRol);

            if (rol.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("mensaje", "El rol no existe"));
            }

            usuario.setRol(rol.get());
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
                "id", actualizado.getId(),
                "username", actualizado.getUsername(),
                "rol", actualizado.getRol().getNombre()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {

        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        usuarioRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("mensaje", "Usuario eliminado correctamente")
        );
    }
}
