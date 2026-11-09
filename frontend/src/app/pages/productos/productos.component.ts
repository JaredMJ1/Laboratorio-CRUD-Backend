import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import {
  ProductosService,
  Producto,
  Categoria
} from '../../services/productos.service';

import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];

  busqueda = '';
  mostrarFormulario = false;
  modoEdicion = false;

  productoSeleccionado: number | null = null;

  producto: Producto = this.productoVacio();

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.listarProductos();
    this.listarCategorias();
  }

  productoVacio(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      cantidadStock: 0,
      categoria: { id: 0, nombre: '' }
    };
  }

  listarProductos(): void {
    this.productosService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.filtrarProductos();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  listarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  filtrarProductos(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      (p.descripcion ?? '').toLowerCase().includes(texto) ||
      (p.categoria?.nombre ?? '').toLowerCase().includes(texto)
    );
  }

  nuevoProducto(): void {
    this.producto = this.productoVacio();
    this.modoEdicion = false;
    this.productoSeleccionado = null;
    this.mostrarFormulario = true;
  }

  editarProducto(producto: Producto): void {
    this.producto = {
      ...producto,
      categoria: { ...producto.categoria }
    };

    this.modoEdicion = true;
    this.productoSeleccionado = producto.id ?? null;
    this.mostrarFormulario = true;
  }

  guardarProducto(): void {
    if (
      !this.producto.nombre.trim() ||
      this.producto.precio < 0 ||
      this.producto.cantidadStock < 0 ||
      !this.producto.categoria.id
    ) {
      alert('Completa los campos correctamente y selecciona una categoría.');
      return;
    }

    const peticion = this.modoEdicion && this.productoSeleccionado !== null
      ? this.productosService.actualizar(
          this.productoSeleccionado,
          this.producto
        )
      : this.productosService.crear(this.producto);

    peticion.subscribe({
      next: () => {
        this.listarProductos();
        this.cancelarFormulario();
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);
        alert('No se pudo guardar el producto.');
      }
    });
  }

  eliminarProducto(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.productosService.eliminar(id).subscribe({
      next: () => this.listarProductos(),
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        alert('No se pudo eliminar el producto.');
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.producto = this.productoVacio();
    this.productoSeleccionado = null;
  }
}


