import { ItemImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

// @ts-ignore - window.ENV is injected at runtime
const API_URL = window.ENV?.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ImageGalleryProps {
  images: ItemImage[];
  onDelete: (imageId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ImageGallery({ images, onDelete, isLoading = false }: ImageGalleryProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (imageId: string) => {
    setDeletingIds((prev) => new Set([...prev, imageId]));
    try {
      await onDelete(imageId);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(imageId);
        return next;
      });
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Aucune photo ajoutée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => {
        // Construct image URL - ensure proper formatting
        const filePath = image.filePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const imageUrl = `${baseUrl}/uploads/${filePath}`;

        return (
        <div key={image.id} className="relative group">
          <img
            src={imageUrl}
            alt="Item image"
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(image.id)}
              disabled={deletingIds.has(image.id) || isLoading}
              className="gap-1"
            >
              {deletingIds.has(image.id) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </Button>
          </div>
          <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {image.displayOrder + 1}
          </span>
        </div>
        );
      })}
    </div>
  );
}
