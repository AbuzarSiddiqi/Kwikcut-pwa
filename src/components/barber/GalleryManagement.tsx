import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

export const GalleryManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const barberRef = doc(db, 'barbers', currentUser!.id);
      const barberDoc = await getDoc(barberRef);

      if (barberDoc.exists()) {
        setImages(barberDoc.data().images || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const timestamp = Date.now();
      const storageRef = ref(storage, `barbers/${currentUser!.id}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      const updatedImages = [...images, imageUrl];
      const barberRef = doc(db, 'barbers', currentUser!.id);
      await updateDoc(barberRef, { images: updatedImages });

      setImages(updatedImages);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setError('');

      // Delete from storage
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      // Update Firestore
      const updatedImages = images.filter(img => img !== imageUrl);
      const barberRef = doc(db, 'barbers', currentUser!.id);
      await updateDoc(barberRef, { images: updatedImages });

      setImages(updatedImages);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Gallery</h2>
          <p className="text-gray-600 mt-1">Showcase your shop with images ({images.length}/10)</p>
        </div>
        {images.length < 10 && (
          <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images yet"
          description="Upload images of your shop to attract more customers"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group">
              <img
                src={imageUrl}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <button
                  onClick={() => handleDeleteImage(imageUrl)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length >= 10 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          <strong>Maximum images reached.</strong> Delete an image to upload a new one.
        </div>
      )}
    </div>
  );
};
