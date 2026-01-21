import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  MapPin,
  Palette,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import logo from "@/assets/logo-user.png";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

// Predefined accessible color palette (shared with GymMappings.tsx)
const GRADE_COLORS = [
  { hex: "#FACC15", name: "Yellow" },
  { hex: "#22C55E", name: "Green" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#A855F7", name: "Purple" },
  { hex: "#F97316", name: "Orange" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#06B6D4", name: "Cyan" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#9CA3AF", name: "Gray" },
] as const;

type GradingType = Database["public"]["Enums"]["grading_type"];

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
  "V15",
  "V16",
  "V17",
];
const NUMERIC_GRADES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const DEFAULT_COLORS = [
  {
    label: "Yellow",
    color_hex: "#FACC15",
    approx_v_min: "V0",
    approx_v_max: "V1",
    approx_font_min: "4",
    approx_font_max: "5",
  },
  {
    label: "Green",
    color_hex: "#22C55E",
    approx_v_min: "V2",
    approx_v_max: "V3",
    approx_font_min: "5+",
    approx_font_max: "6a+",
  },
  {
    label: "Blue",
    color_hex: "#3B82F6",
    approx_v_min: "V4",
    approx_v_max: "V5",
    approx_font_min: "6b",
    approx_font_max: "6c+",
  },
  {
    label: "Red",
    color_hex: "#EF4444",
    approx_v_min: "V6",
    approx_v_max: "V7",
    approx_font_min: "7a",
    approx_font_max: "7b",
  },
  {
    label: "Black",
    color_hex: "#1F2937",
    approx_v_min: "V8",
    approx_v_max: "V10",
    approx_font_min: "7b+",
    approx_font_max: "8a",
  },
];

interface LocalGradeMapping {
  label: string;
  color_hex: string;
  approx_font_min: string;
  approx_font_max: string;
  approx_v_min: string;
  approx_v_max: string;
}

// Default numeric mappings for numeric grading type
const DEFAULT_NUMERIC: LocalGradeMapping[] = Array.from(
  { length: 9 },
  (_, i) => ({
    label: String(i + 1),
    color_hex: "#6B7280", // Neutral gray
    approx_v_min: V_GRADES[Math.min(i * 2, V_GRADES.length - 1)],
    approx_v_max: V_GRADES[Math.min(i * 2 + 1, V_GRADES.length - 1)],
    approx_font_min: FONT_GRADES[Math.min(i * 2, FONT_GRADES.length - 1)],
    approx_font_max: FONT_GRADES[Math.min(i * 2 + 1, FONT_GRADES.length - 1)],
  }),
);

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Profile
  // NOTE: preferred_grade is deprecated - user level is now computed automatically from boulder logs
  const [displayName, setDisplayName] = useState("");

  // Step 2: Gym - track created gym ID to avoid duplicates
  const [gymName, setGymName] = useState("");
  const [gymCity, setGymCity] = useState("");
  const [gradingType, setGradingType] = useState<GradingType>("colors");
  const [createdGymId, setCreatedGymId] = useState<string | null>(null);

  // Step 3: Grade mappings - initialized based on grading type
  const [gradeMappings, setGradeMappings] =
    useState<LocalGradeMapping[]>(DEFAULT_COLORS);

  // NOTE: preferred_grade field is deprecated and no longer used
  // User level is now computed automatically from boulder logs
  // See src/lib/userLevel.ts for the computation logic

  const handleProfileSubmit = async () => {
    if (!user || !displayName) return;
    setSubmitting(true);

    // Only update display_name - preferred_grade is deprecated
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("onboarding.profileSaveError"),
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    } else {
      setStep(2);
    }
    setSubmitting(false);
  };

  const handleGymSubmit = async () => {
    if (!user || !gymName) return;
    setSubmitting(true);

    let gymId = createdGymId;

    // If gym already created (user went back), update it instead
    if (gymId) {
      const { error } = await supabase
        .from("gyms")
        .update({
          name: gymName,
          city: gymCity || null,
          grading_type: gradingType,
        })
        .eq("id", gymId);

      if (error) {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Delete old mappings if grading type changed
      await supabase.from("gym_grade_mappings").delete().eq("gym_id", gymId);
    } else {
      // Create new gym
      const { data, error } = await supabase
        .from("gyms")
        .insert({
          user_id: user.id,
          name: gymName,
          city: gymCity || null,
          grading_type: gradingType,
        })
        .select("id")
        .single();

      if (error || !data) {
        toast({
          title: t("common.error"),
          description: error?.message || "Failed to create gym",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      gymId = data.id;
      setCreatedGymId(gymId);
    }

    // For Font/V-scale, auto-create mappings and finish
    if (gradingType === "font" || gradingType === "v_scale") {
      const grades = gradingType === "font" ? FONT_GRADES : V_GRADES;
      const mappings = grades.map((g, i) => ({
        gym_id: gymId!,
        label: g,
        order_index: i,
        approx_font_min: gradingType === "font" ? g : null,
        approx_font_max: gradingType === "font" ? g : null,
        approx_v_min: gradingType === "v_scale" ? g : null,
        approx_v_max: gradingType === "v_scale" ? g : null,
      }));

      await supabase.from("gym_grade_mappings").insert(mappings);
      await finishOnboarding();
    } else {
      // For colors/numeric, set appropriate default mappings and proceed to step 3
      if (gradingType === "numeric") {
        setGradeMappings(DEFAULT_NUMERIC);
      } else {
        setGradeMappings(DEFAULT_COLORS);
      }
      setStep(3);
    }
    setSubmitting(false);
  };

  const handleMappingsSubmit = async () => {
    if (!user || !createdGymId) return;
    setSubmitting(true);

    // Delete any existing mappings first (in case user went back)
    await supabase
      .from("gym_grade_mappings")
      .delete()
      .eq("gym_id", createdGymId);

    const mappings = gradeMappings.map((m, i) => ({
      gym_id: createdGymId,
      label: m.label,
      order_index: i,
      color_hex: m.color_hex,
      approx_font_min: m.approx_font_min,
      approx_font_max: m.approx_font_max,
      approx_v_min: m.approx_v_min,
      approx_v_max: m.approx_v_max,
    }));

    const { error } = await supabase
      .from("gym_grade_mappings")
      .insert(mappings);

    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      await finishOnboarding();
    }
    setSubmitting(false);
  };

  const finishOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["gyms"] });
    await queryClient.invalidateQueries({ queryKey: ["gym_grade_mappings"] });
    toast({
      title: t("common.success"),
      description: t("onboarding.onboardingComplete"),
    });
    navigate("/");
  };

  const updateMapping = (
    index: number,
    field: keyof LocalGradeMapping,
    value: string,
  ) => {
    setGradeMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const addMapping = () => {
    // Branch label by grading type
    const isNumeric = gradingType === "numeric";
    const newLabel = isNumeric
      ? String(gradeMappings.length + 1) // Numeric: next number
      : "New color"; // Colors: placeholder color name

    setGradeMappings((prev) => [
      ...prev,
      {
        label: newLabel,
        color_hex: "#9CA3AF",
        approx_font_min: "6a",
        approx_font_max: "6b",
        approx_v_min: "V3",
        approx_v_max: "V4",
      },
    ]);
  };

  const removeMapping = (index: number) => {
    if (gradeMappings.length > 1) {
      setGradeMappings((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-lg glass animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <img
            src={logo}
            alt="BoulderLog"
            className="mx-auto w-24 h-24 object-contain"
          />
          <div>
            <CardTitle className="text-2xl">
              {t("onboarding.welcome")}
            </CardTitle>
            <CardDescription>{t("onboarding.letsSetup")}</CardDescription>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5 text-primary" />
                {t("onboarding.yourProfile")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">
                  {t("settings.displayName")} *
                </Label>
                <Input
                  id="displayName"
                  placeholder={t("settings.displayNamePlaceholder")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {t(
                  "onboarding.levelAutoComputed",
                  "Your climbing level will be calculated automatically from your logged sessions.",
                )}
              </p>

              <Button
                className="w-full"
                onClick={handleProfileSubmit}
                disabled={!displayName || submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("common.continue")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Gym */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5 text-primary" />
                {t("onboarding.yourFirstGym")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymName">{t("onboarding.gymName")} *</Label>
                <Input
                  id="gymName"
                  placeholder={t("onboarding.gymNamePlaceholder")}
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymCity">{t("onboarding.city")}</Label>
                <Input
                  id="gymCity"
                  placeholder={t("onboarding.cityPlaceholder")}
                  value={gymCity}
                  onChange={(e) => setGymCity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.gradingSystemRequired")}</Label>
                <Select
                  value={gradingType}
                  onValueChange={(v) => setGradingType(v as GradingType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colors">
                      {t("gyms.colorsDesc", "Colors (Yellow, Green, Blue...)")}
                    </SelectItem>
                    <SelectItem value="numeric">
                      {t("gyms.numericDesc", "Numeric (1, 2, 3...)")}
                    </SelectItem>
                    <SelectItem value="font">
                      Fontainebleau (6a, 7a...)
                    </SelectItem>
                    <SelectItem value="v_scale">V-Scale (V0, V1...)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleGymSubmit}
                  disabled={!gymName || submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {gradingType === "colors" || gradingType === "numeric"
                    ? t("common.continue")
                    : t("common.finish")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Grade Mappings (for colors/numeric) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Palette className="h-5 w-5 text-primary" />
                {t("onboarding.configureGrades")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.mapGradesDesc", {
                  type:
                    gradingType === "colors"
                      ? t("onboarding.color")
                      : t("onboarding.level"),
                })}
              </p>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {gradeMappings.map((mapping, index) => (
                  <Card key={index} className="p-3 bg-secondary/50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {/* Fixed color palette selector - same as GymMappings */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: mapping.color_hex || "#9CA3AF",
                              }}
                              aria-label={t(
                                "gradeMappings.selectColor",
                                "Select color",
                              )}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                {t("gradeMappings.selectColor", "Select color")}
                              </p>
                              <div className="grid grid-cols-5 gap-2">
                                {GRADE_COLORS.map((color) => {
                                  const isSelected =
                                    mapping.color_hex === color.hex;
                                  const isUsed = gradeMappings.some(
                                    (m, i) =>
                                      i !== index && m.color_hex === color.hex,
                                  );
                                  return (
                                    <button
                                      key={color.hex}
                                      type="button"
                                      onClick={() =>
                                        updateMapping(
                                          index,
                                          "color_hex",
                                          color.hex,
                                        )
                                      }
                                      className={`w-8 h-8 rounded-md border-2 transition-all flex items-center justify-center ${
                                        isSelected
                                          ? "border-primary ring-2 ring-primary/50"
                                          : isUsed
                                            ? "border-border/50 opacity-40 cursor-not-allowed"
                                            : "border-border hover:border-primary/50"
                                      }`}
                                      style={{ backgroundColor: color.hex }}
                                      disabled={isUsed && !isSelected}
                                      title={
                                        isUsed
                                          ? `${color.name} (${t("gradeMappings.alreadyUsed", "already used")})`
                                          : color.name
                                      }
                                    >
                                      {isSelected && (
                                        <Check
                                          className={`h-4 w-4 ${color.hex === "#FFFFFF" || color.hex === "#FACC15" ? "text-black" : "text-white"}`}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {GRADE_COLORS.find(
                                  (c) => c.hex === mapping.color_hex,
                                )?.name || "Gray"}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          placeholder="Label"
                          value={mapping.label}
                          onChange={(e) =>
                            updateMapping(index, "label", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMapping(index)}
                          disabled={gradeMappings.length <= 1}
                        >
                          ×
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">
                            {t("onboarding.vScaleRange")}
                          </Label>
                          <div className="flex gap-1">
                            <Select
                              value={mapping.approx_v_min}
                              onValueChange={(v) =>
                                updateMapping(index, "approx_v_min", v)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {V_GRADES.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="self-center text-muted-foreground">
                              -
                            </span>
                            <Select
                              value={mapping.approx_v_max}
                              onValueChange={(v) =>
                                updateMapping(index, "approx_v_max", v)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {V_GRADES.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">
                            {t("onboarding.fontRange")}
                          </Label>
                          <div className="flex gap-1">
                            <Select
                              value={mapping.approx_font_min}
                              onValueChange={(v) =>
                                updateMapping(index, "approx_font_min", v)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_GRADES.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="self-center text-muted-foreground">
                              -
                            </span>
                            <Select
                              value={mapping.approx_font_max}
                              onValueChange={(v) =>
                                updateMapping(index, "approx_font_max", v)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_GRADES.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" onClick={addMapping} className="w-full">
                + {t("onboarding.addGrade")}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleMappingsSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("common.finish")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
