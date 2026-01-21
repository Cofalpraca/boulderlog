import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  ChevronLeft,
  Settings,
  Loader2,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

type GradingType = Database["public"]["Enums"]["grading_type"];
type Gym = Database["public"]["Tables"]["gyms"]["Row"];

export default function Gyms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cacheData, isOnline } = useOfflineStorage();
  const { t } = useTranslation();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);

  const GRADING_LABELS: Record<GradingType, string> = {
    font: "Fontainebleau",
    v_scale: "V-Scale",
    colors: t("gyms.colors", "Colors"),
    numeric: t("gyms.numeric", "Numeric"),
  };

  const { data: gyms, isLoading } = useQuery({
    queryKey: ["gyms", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .eq("user_id", user!.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Cache gyms and their grade mappings for offline use
  useEffect(() => {
    if (gyms?.length && isOnline && user) {
      // Cache gyms
      cacheData(`gyms_${user.id}`, gyms);

      // Cache grade mappings for each gym
      gyms.forEach(async (gym) => {
        const { data: mappings } = await supabase
          .from("gym_grade_mappings")
          .select("*")
          .eq("gym_id", gym.id)
          .order("order_index");

        if (mappings?.length) {
          cacheData(`grade_mappings_${gym.id}`, mappings);
        }
      });
    }
  }, [gyms, isOnline, user, cacheData]);

  const { data: mappingsCount } = useQuery({
    queryKey: ["gym_mappings_count", user?.id],
    queryFn: async () => {
      if (!gyms) return {};
      const { data } = await supabase
        .from("gym_grade_mappings")
        .select("gym_id")
        .in(
          "gym_id",
          gyms.map((g) => g.id),
        );

      const counts: Record<string, number> = {};
      data?.forEach((m) => {
        counts[m.gym_id] = (counts[m.gym_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!gyms?.length,
  });

  const deleteGym = useMutation({
    mutationFn: async (gymId: string) => {
      const { error } = await supabase.from("gyms").delete().eq("id", gymId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast({ title: t("gyms.gymDeleted", "Gym deleted") });
    },
    onError: (e: Error) => {
      toast({
        title: t("common.error"),
        description: e.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold">{t("gyms.title")}</h1>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-md">
              <DialogHeader>
                <DialogTitle>{t("gyms.addGym")}</DialogTitle>
              </DialogHeader>
              <GymForm
                onSuccess={() => {
                  setAddDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["gyms"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !gyms?.length ? (
          <Card className="glass text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t("gyms.noGyms")}</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("gyms.addFirstGym")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {gyms.map((gym) => (
              <Card key={gym.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{gym.name}</h3>
                        {gym.city && (
                          <p className="text-sm text-muted-foreground">
                            {gym.city}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            {GRADING_LABELS[gym.grading_type]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {mappingsCount?.[gym.id] || 0} {t("gyms.grades")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/gyms/${gym.id}/mappings`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(t("gyms.deleteConfirm"))) {
                            deleteGym.mutate(gym.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function GymForm({ onSuccess, gym }: { onSuccess: () => void; gym?: Gym }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [name, setName] = useState(gym?.name || "");
  const [city, setCity] = useState(gym?.city || "");
  const [gradingType, setGradingType] = useState<GradingType>(
    gym?.grading_type || "colors",
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setSubmitting(true);

    if (gym) {
      const { error } = await supabase
        .from("gyms")
        .update({ name, city: city || null, grading_type: gradingType })
        .eq("id", gym.id);
      if (error) {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
      }
    } else {
      const { data, error } = await supabase
        .from("gyms")
        .insert({
          user_id: user.id,
          name,
          city: city || null,
          grading_type: gradingType,
        })
        .select("id")
        .single();

      if (error) {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Create default mappings
        const defaultMappings = getDefaultMappings(gradingType, data.id);
        await supabase.from("gym_grade_mappings").insert(defaultMappings);
        onSuccess();
        toast({
          title: t("gyms.gymAdded", "Gym added"),
          description: t(
            "gyms.configureMappings",
            "Configure grade mappings for analytics",
          ),
        });
      }
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("onboarding.gymName")} *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">{t("onboarding.city")}</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("onboarding.cityPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("gyms.gradeSystem", "Grading System")}</Label>
        <Select
          value={gradingType}
          onValueChange={(v) => setGradingType(v as GradingType)}
          disabled={!!gym}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="colors">
              {t("gyms.colorsSystem", "Colors")}
            </SelectItem>
            <SelectItem value="numeric">
              {t("gyms.numericSystem", "Numeric")}
            </SelectItem>
            <SelectItem value="font">Fontainebleau</SelectItem>
            <SelectItem value="v_scale">V-Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={!name || submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {gym ? t("gyms.updateGym", "Update Gym") : t("gyms.addGym")}
      </Button>
    </form>
  );
}

const FONT_GRADES = [
  "4",
  "4+",
  "5",
  "5+",
  "5a",
  "5a+",
  "5b",
  "5b+",
  "5c",
  "5c+",
  "6a",
  "6a+",
  "6b",
  "6b+",
  "6c",
  "6c+",
  "7a",
  "7a+",
  "7b",
  "7b+",
  "7c",
  "7c+",
  "8a",
  "8a+",
  "8b",
];
const V_GRADES = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
];

function getDefaultMappings(gradingType: GradingType, gymId: string) {
  if (gradingType === "font") {
    return [
      "4",
      "4+",
      "5",
      "5+",
      "5a",
      "5a+",
      "5b",
      "5b+",
      "5c",
      "5c+",
      "6a",
      "6a+",
      "6b",
      "6b+",
      "6c",
      "6c+",
      "7a",
      "7a+",
      "7b",
      "7b+",
      "7c",
      "7c+",
      "8a",
    ].map((g, i) => ({
      gym_id: gymId,
      label: g,
      order_index: i,
      approx_font_min: g,
      approx_font_max: g,
      approx_v_min: null,
      approx_v_max: null,
    }));
  }
  if (gradingType === "v_scale") {
    return [
      "V0",
      "V1",
      "V2",
      "V3",
      "V4",
      "V5",
      "V6",
      "V7",
      "V8",
      "V9",
      "V10",
      "V11",
      "V12",
    ].map((g, i) => ({
      gym_id: gymId,
      label: g,
      order_index: i,
      approx_v_min: g,
      approx_v_max: g,
      approx_font_min: null,
      approx_font_max: null,
    }));
  }
  // Numeric grading: 1-9 with neutral gray color
  if (gradingType === "numeric") {
    return Array.from({ length: 9 }, (_, i) => ({
      gym_id: gymId,
      label: String(i + 1),
      order_index: i,
      color_hex: "#6B7280", // Neutral gray
      approx_v_min: V_GRADES[Math.min(i * 2, V_GRADES.length - 1)],
      approx_v_max: V_GRADES[Math.min(i * 2 + 1, V_GRADES.length - 1)],
      approx_font_min: FONT_GRADES[Math.min(i * 2, FONT_GRADES.length - 1)],
      approx_font_max: FONT_GRADES[Math.min(i * 2 + 1, FONT_GRADES.length - 1)],
    }));
  }
  // Default: color mappings
  return [
    {
      gym_id: gymId,
      label: "Yellow",
      order_index: 0,
      color_hex: "#FACC15",
      approx_v_min: "V0",
      approx_v_max: "V1",
      approx_font_min: "4",
      approx_font_max: "5",
    },
    {
      gym_id: gymId,
      label: "Green",
      order_index: 1,
      color_hex: "#22C55E",
      approx_v_min: "V2",
      approx_v_max: "V3",
      approx_font_min: "5+",
      approx_font_max: "6a+",
    },
    {
      gym_id: gymId,
      label: "Blue",
      order_index: 2,
      color_hex: "#3B82F6",
      approx_v_min: "V4",
      approx_v_max: "V5",
      approx_font_min: "6b",
      approx_font_max: "6c+",
    },
    {
      gym_id: gymId,
      label: "Red",
      order_index: 3,
      color_hex: "#EF4444",
      approx_v_min: "V6",
      approx_v_max: "V7",
      approx_font_min: "7a",
      approx_font_max: "7b",
    },
    {
      gym_id: gymId,
      label: "Black",
      order_index: 4,
      color_hex: "#1F2937",
      approx_v_min: "V8",
      approx_v_max: "V10",
      approx_font_min: "7b+",
      approx_font_max: "8a",
    },
  ];
}
