import { useState } from "react";
import { Item, ItemCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { categories } from "@/lib/categories";
import { Loader2, AlertCircle } from "lucide-react";

interface ItemFormProps {
  item?: Item | null;
  onSubmit: (data: {
    title: string;
    description: string;
    category: ItemCategory;
  }) => Promise<void>;
  isLoading?: boolean;
  buttonText?: string;
}

export function ItemForm({
  item,
  onSubmit,
  isLoading = false,
  buttonText = "Créer l'objet",
}: ItemFormProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [category, setCategory] = useState<ItemCategory>(item?.category || "TOOLS");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Le titre est obligatoire";
    } else if (title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    }

    if (description.trim().length > 500) {
      newErrors.description = "La description ne doit pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({ title, description, category });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'objet</Label>
        <Input
          id="title"
          placeholder="Ex: Perceuse électrique"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          disabled={isLoading}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.title}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="description">Description</Label>
          <span className="text-xs text-muted-foreground">
            {description.length}/500
          </span>
        </div>
        <Textarea
          id="description"
          placeholder="Décris l'état et les caractéristiques de l'objet..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors({ ...errors, description: undefined });
          }}
          rows={4}
          disabled={isLoading}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.description}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select value={category} onValueChange={(val) => setCategory(val as ItemCategory)}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
    </form>
  );
}
