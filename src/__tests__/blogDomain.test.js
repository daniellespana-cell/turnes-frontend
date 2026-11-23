import { describe, it, expect } from 'vitest';
import {
  slugify,
  calculateReadTime,
  normalizeBlogPost,
  validateBlogPost,
  BLOG_CATEGORIES_CONFIG
} from '../domain/blog.mapper';

describe('blog.mapper - Domain Logic', () => {
  describe('slugify', () => {
    it('generates clean SEO-friendly slug from title with accents and special characters', () => {
      const input = '¡Cómo calcular turnos extras en Colombia en 2026!';
      const expected = 'como-calcular-turnos-extras-en-colombia-en-2026';
      expect(slugify(input)).toBe(expected);
    });

    it('handles multiple consecutive spaces and dashes correctly', () => {
      const input = '  Gestión  --- de   restaurantes  y bares  ';
      const expected = 'gestion-de-restaurantes-y-bares';
      expect(slugify(input)).toBe(expected);
    });

    it('returns empty string for empty or non-string inputs', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null)).toBe('');
      expect(slugify(undefined)).toBe('');
      expect(slugify(12345)).toBe('');
    });
  });

  describe('calculateReadTime', () => {
    it('calculates read time based on 200 words per minute', () => {
      const paragraph = new Array(400).fill('palabra').join(' ');
      const sections = [
        {
          title: 'Sección 1',
          paragraphs: [paragraph]
        }
      ];
      // 400 + 2 words / 200 = 3 min
      expect(calculateReadTime(sections)).toBe('3 min de lectura');
    });

    it('returns minimum 1 min for short content', () => {
      const sections = [
        {
          title: 'Intro',
          paragraphs: ['Un párrafo muy corto.']
        }
      ];
      expect(calculateReadTime(sections)).toBe('1 min de lectura');
    });

    it('returns default fallback for empty sections', () => {
      expect(calculateReadTime([])).toBe('3 min de lectura');
      expect(calculateReadTime(null)).toBe('3 min de lectura');
    });
  });

  describe('normalizeBlogPost', () => {
    it('maps database snake_case fields to UI camelCase correctly', () => {
      const dbRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'guia-turnos-2026',
        title: 'Guía de Turnos 2026',
        excerpt: 'Todo lo que necesitas saber.',
        category: 'empresas',
        cover_url: 'https://example.com/cover.webp',
        featured: true,
        sections: [{ id: 'sec-1', title: 'Intro', paragraphs: ['Hola'] }],
        status: 'published',
        views_count: 42,
        created_at: '2026-05-10T12:00:00Z'
      };

      const normalized = normalizeBlogPost(dbRow);
      expect(normalized).toBeDefined();
      expect(normalized.id).toBe(dbRow.id);
      expect(normalized.slug).toBe(dbRow.slug);
      expect(normalized.title).toBe(dbRow.title);
      expect(normalized.excerpt).toBe(dbRow.excerpt);
      expect(normalized.category).toBe('empresas');
      expect(normalized.categoryName).toBe('Para Empresas y Negocios');
      expect(normalized.coverUrl).toBe(dbRow.cover_url);
      expect(normalized.featured).toBe(true);
      expect(normalized.viewsCount).toBe(42);
      expect(normalized.author.name).toBe('Equipo Editorial Turnes');
    });

    it('returns null if input is null or not an object', () => {
      expect(normalizeBlogPost(null)).toBeNull();
      expect(normalizeBlogPost(undefined)).toBeNull();
      expect(normalizeBlogPost('invalid')).toBeNull();
    });
  });

  describe('validateBlogPost', () => {
    const validPost = {
      title: 'Nuevo Artículo de Operaciones',
      excerpt: 'Resumen conciso y claro para el lector.',
      category: 'empresas',
      sections: [
        {
          id: 'sec-1',
          title: 'Sección 1',
          paragraphs: ['Contenido del párrafo']
        }
      ]
    };

    it('passes for a well-formed blog post', () => {
      const result = validateBlogPost(validPost);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('fails when title is missing or empty', () => {
      const result = validateBlogPost({ ...validPost, title: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/título/i);
    });

    it('fails when excerpt is missing or empty', () => {
      const result = validateBlogPost({ ...validPost, excerpt: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/resumen/i);
    });

    it('fails when category is invalid or "todos"', () => {
      const result = validateBlogPost({ ...validPost, category: 'todos' });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/categoría/i);
    });

    it('fails when sections array is empty', () => {
      const result = validateBlogPost({ ...validPost, sections: [] });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/sección/i);
    });
  });
});
