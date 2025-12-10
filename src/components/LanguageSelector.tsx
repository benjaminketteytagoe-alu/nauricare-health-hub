import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "rw", name: "Kinyarwanda", native: "Ikinyarwanda" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "fr", name: "French", native: "Français" },
];

interface LanguageSelectorProps {
  currentLanguage?: string | null;
  onLanguageChange?: (language: string) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || "en");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const handleLanguageChange = async (value: string) => {
    setSelectedLanguage(value);
    setIsLoading(true);

    try {
      if (user) {
        const { error } = await supabase
          .from("patient_profiles")
          .update({ language: value })
          .eq("user_id", user.id);

        if (error) throw error;
      }

      onLanguageChange?.(value);
      toast.success("Language updated successfully");
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error("Failed to update language");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language
        </CardTitle>
        <CardDescription>
          Choose your preferred language for the app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.native}</span>
                  <span className="text-muted-foreground">({lang.name})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
