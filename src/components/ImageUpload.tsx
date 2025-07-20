import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  currentImage?: string;
  position: 'header' | 'sidebar' | 'footer';
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload, 
  currentImage, 
  position,
  className = '' 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Position-based size recommendations
  const getSizeRecommendations = () => {
    switch (position) {
      case 'header':
        return {
          width: '800px',
          height: '120px',
          maxSize: '2MB',
          description: 'Header reklamları için önerilen boyut'
        };
      case 'sidebar':
        return {
          width: '300px',
          height: '250px',
          maxSize: '1MB',
          description: 'Yan panel reklamları için önerilen boyut'
        };
      case 'footer':
        return {
          width: '728px',
          height: '90px',
          maxSize: '1.5MB',
          description: 'Footer reklamları için önerilen boyut'
        };
      default:
        return {
          width: '400px',
          height: '200px',
          maxSize: '2MB',
          description: 'Genel reklam boyutu'
        };
    }
  };

  const sizeRec = getSizeRecommendations();

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası yükleyin');
      return;
    }

    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      setUploading(false);
      toast.success('Resim başarıyla yüklendi');
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error('Resim yüklenirken hata oluştu');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = () => {
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Size Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-3 transition-colors">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 transition-colors">
          {sizeRec.description}
        </h4>
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1 transition-colors">
          <p>• Önerilen boyut: {sizeRec.width} x {sizeRec.height}</p>
          <p>• Maksimum dosya boyutu: {sizeRec.maxSize}</p>
          <p>• Desteklenen formatlar: JPG, PNG, GIF, WebP</p>
        </div>
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="Reklam görseli"
            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-3">
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {currentImage ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
              {uploading ? 'Yükleniyor...' : currentImage ? 'Resmi değiştir' : 'Resim yükle'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
              Sürükle bırak veya tıklayarak seç
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;