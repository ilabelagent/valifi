import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Heart, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PreTradePrayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tradeDetails: {
    symbol?: string;
    type?: string;
    amount?: string | number;
    price?: string | number;
  };
}

export function PreTradePrayerModal({
  open,
  onOpenChange,
  onConfirm,
  tradeDetails,
}: PreTradePrayerModalProps) {
  const { toast } = useToast();
  const [prayerText, setPrayerText] = useState("");
  const [prayerId, setPrayerId] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["/api/prayers/settings"],
  });

  const { data: scripture, refetch: refetchScripture } = useQuery({
    queryKey: ["/api/prayers/random-scripture"],
    enabled: open,
  });

  const logPrayerMutation = useMutation({
    mutationFn: async (prayer: { prayerText: string; category: string }) => {
      const res = await apiRequest("POST", "/api/prayers", prayer);
      return res.json();
    },
    onSuccess: (data) => {
      setPrayerId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
    },
  });

  const handleProceed = () => {
    if (prayerText.trim()) {
      logPrayerMutation.mutate({
        prayerText,
        category: "trade_guidance",
      });
    }
    onConfirm();
    onOpenChange(false);
    setPrayerText("");
  };

  const handleSkip = () => {
    onConfirm();
    onOpenChange(false);
    setPrayerText("");
  };

  useEffect(() => {
    if (open) {
      refetchScripture();
      setPrayerText("");
      setPrayerId(null);
    }
  }, [open, refetchScripture]);

  // Don't show modal if pre-trade prayers are disabled
  if (!settings?.enablePreTrade) {
    if (open) {
      handleSkip();
    }
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-pre-trade-prayer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Seek Divine Guidance Before Trading
          </DialogTitle>
          <DialogDescription>
            Take a moment to pray and seek wisdom before executing this trade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Trade Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {tradeDetails.symbol && (
                <div>
                  <span className="text-muted-foreground">Symbol: </span>
                  <span className="font-medium">{tradeDetails.symbol}</span>
                </div>
              )}
              {tradeDetails.type && (
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <Badge variant="outline">{tradeDetails.type}</Badge>
                </div>
              )}
              {tradeDetails.amount && (
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">{tradeDetails.amount}</span>
                </div>
              )}
              {tradeDetails.price && (
                <div>
                  <span className="text-muted-foreground">Price: </span>
                  <span className="font-medium">{tradeDetails.price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scripture Verse */}
          {scripture && (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                    Scripture for Guidance
                  </h3>
                </div>
              </div>
              <ScrollArea className="max-h-32">
                <blockquote className="text-sm italic border-l-4 border-yellow-500 pl-3 py-1">
                  "{scripture.verse}"
                </blockquote>
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mt-2">
                  - {scripture.reference}
                </p>
              </ScrollArea>
            </div>
          )}

          {/* Prayer Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Your Prayer (Optional)
            </label>
            <Textarea
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder="Lord, guide me in this decision... Grant me wisdom to make the right choice... Help me to be a good steward of your blessings..."
              className="min-h-[120px]"
              data-testid="textarea-pre-trade-prayer"
            />
            <p className="text-xs text-muted-foreground">
              Your prayer will be saved and can be correlated with trade outcomes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              data-testid="button-skip-prayer"
            >
              Skip Prayer
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setPrayerText("");
                }}
                data-testid="button-cancel-trade"
              >
                Cancel Trade
              </Button>
              <Button
                onClick={handleProceed}
                className="gap-2"
                disabled={logPrayerMutation.isPending}
                data-testid="button-proceed-with-trade"
              >
                {prayerText.trim() && <Send className="h-4 w-4" />}
                Proceed with Trade
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
