package crudbackend.service;

import crudbackend.entity.Producto;
import crudbackend.entity.Categoria;
import crudbackend.repository.ProductoRepository;
import crudbackend.repository.CategoriaRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository) {

        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> buscarProducto(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardarProducto(Producto producto) {

        if (producto.getCategoria() == null ||
                producto.getCategoria().getId() == null) {
            throw new IllegalArgumentException(
                    "Debe indicar una categoría"
            );
        }

        Long categoriaId = producto.getCategoria().getId();

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría no existe"
                ));

        producto.setCategoria(categoria);

        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id) {

        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "El producto no existe"
            );
        }

        productoRepository.deleteById(id);
    }

    public Producto actualizarProducto(Long id, Producto datos) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El producto no existe"
                ));

        Categoria categoria = categoriaRepository
                .findById(datos.getCategoria().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría no existe"
                ));

        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setCantidadStock(datos.getCantidadStock());
        producto.setCategoria(categoria);

        return productoRepository.save(producto);
    }

}