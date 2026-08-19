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
