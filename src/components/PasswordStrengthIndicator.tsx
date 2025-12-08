import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const getStrengthLevel = (score: number): { label: string; color: string } => {
  if (score === 0) return { label: "", color: "" };
  if (score <= 2) return { label: "Weak", color: "bg-destructive" };
  if (score <= 3) return { label: "Fair", color: "bg-amber-500" };
  if (score <= 4) return { label: "Good", color: "bg-primary" };
  return { label: "Strong", color: "bg-green-500" };
};

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { score, metRequirements } = useMemo(() => {
    const met = requirements.map((req) => req.test(password));
    const count = met.filter(Boolean).length;
    return { score: count, metRequirements: met };
  }, [password]);

  const strength = getStrengthLevel(score);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2 animate-fade-in">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          {strength.label && (
            <span className={`text-xs font-medium ${
              score <= 2 ? "text-destructive" : 
              score <= 3 ? "text-amber-500" : 
              score <= 4 ? "text-primary" : "text-green-500"
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                level <= score ? strength.color : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req, index) => (
          <div
            key={req.label}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              metRequirements[index] ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {metRequirements[index] ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
