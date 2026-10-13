package crudbackend.config;

import crudbackend.entity.Usuario;
import crudbackend.entity.Rol;
import crudbackend.repository.UsuarioRepository;
import crudbackend.repository.RolRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner inicializarDatos(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            Rol rolAdmin = rolRepository.findByNombre("SUPER-ADMIN-ROLE")
                    .orElseThrow(() -> new RuntimeException(
                            "No existe el rol SUPER-ADMIN-ROLE"
                    ));

            Rol rolUser = rolRepository.findByNombre("USER")
                    .orElseThrow(() -> new RuntimeException(
                            "No existe el rol USER"
                    ));

            if (usuarioRepository.findByUsername("admin").isEmpty()) {

                Usuario admin = new Usuario();

                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("Admin123!"));
                admin.setRol(rolAdmin);

                usuarioRepository.save(admin);
            }

            if (usuarioRepository.findByUsername("usuario").isEmpty()) {

                Usuario usuario = new Usuario();

                usuario.setUsername("usuario");
                usuario.setPassword(passwordEncoder.encode("Usuario123!"));
                usuario.setRol(rolUser);

                usuarioRepository.save(usuario);
            }

        };


    }
}
