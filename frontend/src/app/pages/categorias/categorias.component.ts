
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import { CategoriasService } from '../../services/categorias.service';
import { Categoria } from '../../services/productos.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {

  categorias: Categoria[] = [];

  mostrarFormulario = false;
  modoEdicion = false;
  busqueda = '';

  categoria: Categoria = this.categoriaVacia();

  constructor(
  private categoriasService: CategoriasService,
  public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.listarCategorias();
  }

  categoriaVacia(): Categoria {
    return {
      id: 0,
      nombre: '',
      descripcion: ''
    };
  }

  listarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        alert('No se pudieron cargar las categorías.');
      }
    });
  }

  get categoriasFiltradas(): Categoria[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(texto) ||
      (c.descripcion ?? '').toLowerCase().includes(texto)
    );
  }

  nuevaCategoria(): void {
    this.categoria = this.categoriaVacia();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  editarCategoria(categoria: Categoria): void {
    this.categoria = { ...categoria };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarCategoria(): void {
    if (!this.categoria.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    const peticion = this.modoEdicion
      ? this.categoriasService.actualizar(this.categoria.id, this.categoria)
      : this.categoriasService.crear(this.categoria);

    peticion.subscribe({
      next: () => {
        this.listarCategorias();
        this.cancelarFormulario();
      },
      error: (error) => {
        console.error('Error al guardar categoría:', error);
        alert('No se pudo guardar la categoría.');
      }
    });
  }

  eliminarCategoria(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }

    this.categoriasService.eliminar(id).subscribe({
      next: () => {
        this.listarCategorias();
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        alert('No se pudo eliminar. Comprueba si tiene productos asociados.');
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.categoria = this.categoriaVacia();
  }
}
