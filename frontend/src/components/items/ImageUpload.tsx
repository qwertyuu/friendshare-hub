import { useRef, useState, useEffect } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  maxImages?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

interface Preview {
  file: File;
  url: string;
  id: string;
}

const MAX_IMAGES = 10;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({
  onFilesSelected,
  isLoading = false,
  maxImages = MAX_IMAGES,
  maxSizeBytes = MAX_SIZE_BYTES,
  acceptedTypes = ACCEPTED_TYPES,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Validate single file
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name}: Format non supporté. Utilise JPG, PNG ou WebP.`;
    }

    if (file.size > maxSizeBytes) {
      const maxMB = maxSizeBytes / (1024 * 1024);
      return `${file.name}: Fichier trop grand (max ${maxMB}MB).`;
    }

    return null;
  };

  // Validate and process files
  const processFiles = (files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check total count
    const totalCount = selectedFiles.length + files.length;
    if (totalCount > maxImages) {
      newErrors.push(`Maximum ${maxImages} images autorisées (${selectedFiles.length} déjà sélectionnées).`);
      return;
    }

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update state with valid files
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    setErrors([]);
    onFilesSelected(newFiles);
  };

  // Handle file select from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    processFiles(files);
  };

  const handleRemoveFile = (id: string) => {
    const newFiles = selectedFiles.filter((_, index) => {
      return previews[index]?.id !== id;
    });
    const newPreviews = previews.filter((p) => p.id !== id);

    setPreviews(newPreviews);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    setErrors([]);
  };

  // Create/update previews when files change
  useEffect(() => {
    const newPreviews: Preview[] = selectedFiles.map((file, index) => {
      const existingPreview = previews[index];
      if (existingPreview?.file === file) {
        return existingPreview;
      }
      return {
        file,
        url: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      };
    });

    setPreviews(newPreviews);

    // Cleanup old URLs
    return () => {
      newPreviews.forEach(preview => {
        const wasInPrevious = previews.find(p => p.id === preview.id);
        if (!wasInPrevious) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [selectedFiles]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Photos de l'objet</Label>
        <span className="text-xs text-muted-foreground">
          {selectedFiles.length}/{maxImages}
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-medium text-foreground">Ajoute tes photos</p>
        <p className="text-sm text-muted-foreground">
          Glisse tes images ici ou clique pour parcourir
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG ou WebP • Max 5MB par image
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={preview.id} className="relative group">
              <img
                src={preview.url}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground truncate mt-1 px-1">
                {preview.file.name}
              </p>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => handleRemoveFile(preview.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <span className="absolute bottom-1 left-1 bg-background/80 px-2 py-1 rounded text-xs">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
