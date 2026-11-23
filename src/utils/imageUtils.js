/**
 * 🖼️ Image Utilities (Single Source of Truth)
 * 
 * Lógica pura de compresión de imágenes en el cliente sin librerías externas.
 * Usamos Canvas nativo para optimizar el tamaño antes de subir al Storage.
 */

/**
 * Comprime una imagen seleccionada por el usuario y la convierte en un Blob Binario.
 * (Blob es 30% más ligero y más rápido de subir que un Base64).
 * 
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo permitido (px)
 * @param {number} maxHeight - Alto máximo permitido (px)
 * @param {number} quality - Calidad JPEG (0.1 a 1.0)
 * @returns {Promise<Blob>} El archivo binario comprimido listo para subir.
 */
export const compressImageToBlob = (file, maxWidth = 500, maxHeight = 500, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file provided"));

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculamos las nuevas dimensiones manteniendo la proporción (Aspect Ratio)
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                // Optimizamos el renderizado
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Exportamos como Blob Binario JPEG
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Error al convertir Canvas a Blob"));
                    }
                }, 'image/jpeg', quality);
            };
            
            img.onerror = () => reject(new Error("Error cargando la imagen para comprimir"));
        };
        
        reader.onerror = () => reject(new Error("Error leyendo el archivo original"));
    });
};

/**
 * Comprime específicamente una foto de portada de blog a formato WebP optimizado.
 * Reduce fotos de hasta 20MB a aproximadamente 120-150KB.
 * 
 * @param {File} file 
 * @returns {Promise<Blob>}
 */
export const compressBlogCover = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No se proporcionó ningún archivo"));

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const MAX_WIDTH = 1440;
                const MAX_HEIGHT = 900;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round(width * (MAX_HEIGHT / height));
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Intentamos WebP (estándar moderno); si falla, fallback a JPEG
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        canvas.toBlob((fallbackBlob) => {
                            if (fallbackBlob) resolve(fallbackBlob);
                            else reject(new Error("Error al comprimir portada del blog"));
                        }, 'image/jpeg', 0.85);
                    }
                }, 'image/webp', 0.85);
            };

            img.onerror = () => reject(new Error("Error procesando imagen para portada"));
        };

        reader.onerror = () => reject(new Error("Error leyendo archivo de portada"));
    });
};
