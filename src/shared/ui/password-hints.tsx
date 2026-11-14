import { cn } from "@shared/lib/cn";
import {
  passwordChecks,
  passwordStrength,
  strengthLabel,
  type PasswordStrength,
} from "@shared/lib/password";

const rules = [
  { key: "lower" as const, label: "Строчную букву — abc" },
  { key: "upper" as const, label: "Заглавную букву — ABC" },
  { key: "digit" as const, label: "Цифру" },
  { key: "length" as const, label: "8 символов" },
];

const strengthTone: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-900",
  strong: "bg-emerald-100 text-emerald-900",
};

export function PasswordHints({ password }: { password: string }) {
  const checks = passwordChecks(password);
  const strength = passwordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-stone-500">Пароль должен содержать:</p>
        {strength !== "empty" ? (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", strengthTone[strength])}>
            {strengthLabel[strength]}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {rules.map((rule) => {
          const ok = checks[rule.key];
          return (
            <span
              key={rule.key}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition",
                ok ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500",
              )}
            >
              {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
