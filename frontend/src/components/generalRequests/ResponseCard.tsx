import { GeneralRequestResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { User, MessageCircle } from "lucide-react";
import { getCategoryEmoji } from "@/lib/categories";

interface ResponseCardProps {
  response: GeneralRequestResponse;
  currentUserId?: string;
}

export function ResponseCard({ response }: ResponseCardProps) {
  return (
    <Card className="p-3 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium">{response.responder.name}</span>
          </div>

          {response.item && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryEmoji(response.item.category)}</span>
              <div>
                <p className="font-semibold text-sm">{response.item.title}</p>
                {response.item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {response.item.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {response.message && (
            <div className="flex gap-2 items-start text-sm">
              <MessageCircle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{response.message}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
