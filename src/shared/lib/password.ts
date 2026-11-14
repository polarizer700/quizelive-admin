export type PasswordChecks = {
  lower: boolean;
  upper: boolean;
  digit: boolean;
  length: boolean;
};

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export function passwordChecks(password: string): PasswordChecks {
  return {
    lower: /[a-zа-яё]/.test(password),
    upper: /[A-ZА-ЯЁ]/.test(password),
    digit: /\d/.test(password),
    length: [...password].length >= 8,
  };
}

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  const checks = passwordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;
  if (passed < 4) return "weak";
  const long = [...password].length >= 12;
  const special = /[^A-Za-zА-Яа-яЁё0-9]/.test(password);
  if (long || special) return "strong";
  return "medium";
}

export function isPasswordStrongEnough(password: string) {
  const checks = passwordChecks(password);
  return checks.lower && checks.upper && checks.digit && checks.length && password.length <= 200;
}

export const strengthLabel: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "Слабый",
  medium: "Средний",
  strong: "Сложный",
};
