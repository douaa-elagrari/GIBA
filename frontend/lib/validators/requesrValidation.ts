export type FormValues = Record<string, string>;

export interface Field {
  name: string;
  type: string;
  label: string;
  options?: { value: string; label: string }[];
  readOnly?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmpty = (v: string | undefined): boolean =>
  !v || v.toString().trim() === "";

const isValidDate = (v: string): boolean => {
  if (!v) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/** Algerian Weekend: Friday (5) and Saturday (6) */
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6;
};

const getToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDate = (v: string): Date => {
  const d = new Date(v);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isValidTime = (v: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);

const isValidNSS = (v: string): boolean => /^\d{18}$/.test(v.replace(/\s/g, ""));

const isValidName = (v: string): boolean => v.trim().length >= 2 && !/\d/.test(v);

const MAX_DAYS: Record<string, number> = {
  "vacation-annual": 30,
  "sick-leave": 180,
  "exceptional-leave": 15,
  "mission-order": 365,
};

// ─── Per-field custom rules ────────────────────────────────────────────────────

function applyCustomRules(
  field: Field,
  value: string,
  values: FormValues,
  errors: Record<string, string>,
  requestType?: string,
): void {
  const today = getToday();

  switch (field.name) {
    // ── Date Handling ──
    case "startDate":
    case "endDate":
    case "date":
    case "date_embauche":
    case "date_naissance": {
      if (!isValidDate(value)) {
        errors[field.name] = "Format invalide (AAAA-MM-JJ)";
        break;
      }

      const parsed = parseDate(value);

      // 1. History Dates (Birth/Hire) -> Must be in the PAST
      if (field.name === "date_naissance" || field.name === "date_embauche") {
        if (parsed >= today) {
          errors[field.name] = "Cette date historique doit être dans le passé";
        } else if (field.name === "date_naissance") {
          const age = (today.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          if (age < 18) {
            errors[field.name] = `Âge insuffisant (${Math.floor(age)} ans). L'employé doit avoir au moins 18 ans.`;
          }
        }
        break;
      }

      // 2. Request Dates (Leaves/Missions/Training) -> Must be TODAY or FUTURE
      if (parsed < today) {
        errors[field.name] = "Action impossible : La date est déjà passée. Veuillez choisir une date à partir d'aujourd'hui.";
        break;
      }

      // 3. Weekend Check for START dates
      if (field.name === "startDate" || field.name === "date") {
        if (isWeekend(parsed)) {
          const day = parsed.getDay() === 5 ? "Vendredi" : "Samedi";
          errors[field.name] = `Le début ne peut pas être un ${day} (Weekend Algérien).`;
        }
      }
      break;
    }

    case "nb_jours": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1) {
        errors[field.name] = "Veuillez entrer un nombre entier positif";
      } else if (requestType && MAX_DAYS[requestType] && n > MAX_DAYS[requestType]) {
        errors[field.name] = `Limite dépassée : Maximum ${MAX_DAYS[requestType]} jours pour ce type de demande.`;
      }
      break;
    }

    case "expectedDuration": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1) {
        errors[field.name] = "Veuillez entrer un nombre entier positif";
      } else if (requestType && MAX_DAYS[requestType] && n > MAX_DAYS[requestType]) {
        errors[field.name] = `Limite dépassée : Maximum ${MAX_DAYS[requestType]} jours pour ce type de demande.`;
      }
      break;
    }

    case "num_secu": {
      const clean = value.replace(/\s/g, "");
      if (!isValidNSS(value)) {
        errors[field.name] = `Le NSS doit contenir 18 chiffres (actuellement: ${clean.length})`;
      }
      break;
    }

    case "interim": {
      if (!isValidName(value)) {
        errors[field.name] = "Nom invalide : 2 caractères minimum et pas de chiffres.";
      }
      break;
    }

    case "startTime":
    case "endTime": {
      if (!isValidTime(value)) errors[field.name] = "Format d'heure invalide (HH:MM)";
      break;
    }
  }
}

// ─── Cross-field rules ─────────────────────────────────────────────────────────

function applyCrossFieldRules(
  values: FormValues,
  errors: Record<string, string>,
  requestType?: string,
): void {
  // 1. Start vs End Date logic
  if (values["startDate"] && values["endDate"] && !errors["startDate"] && !errors["endDate"]) {
    const start = parseDate(values["startDate"]);
    const end = parseDate(values["endDate"]);

    if (start > end) {
      errors["endDate"] = "Incohérence : La date de fin arrive avant la date de début.";
    }

    // Auto-calculate and validate nb_jours
    if (values["nb_jours"] && !errors["nb_jours"]) {
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const nbJours = Number(values["nb_jours"]);
      if (nbJours > diff) {
        errors["nb_jours"] = `Le nombre de jours (${nbJours}) est supérieur à l'intervalle sélectionné (${diff} j).`;
      }
    }
  }

  // 2. Start vs End Time logic
  if (values["startTime"] && values["endTime"] && !errors["startTime"] && !errors["endTime"]) {
    if (values["startTime"] >= values["endTime"]) {
      errors["endTime"] = `L'heure de fin doit être strictement après ${values["startTime"]}.`;
    }
  }

  // 3. Age at Hire Check
  if (values["date_naissance"] && values["date_embauche"] && !errors["date_naissance"] && !errors["date_embauche"]) {
    const birth = parseDate(values["date_naissance"]);
    const hire = parseDate(values["date_embauche"]);
    const ageAtHire = (hire.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageAtHire < 16) {
      errors["date_embauche"] = `L'employé ne pouvait pas avoir ${Math.floor(ageAtHire)} ans lors de son embauche (min. 16 ans).`;
    }
  }
}

// ─── Main Exported Function ────────────────────────────────────────────────────

export function validateRequestForm(
  fields: Field[],
  values: FormValues,
  requestType?: string,
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Mandatory Check
  fields.forEach((field) => {
    if (isEmpty(values[field.name])) {
      errors[field.name] = "Ce champ est obligatoire";
    }
  });

  // 2. Per-Field Validation
  fields.forEach((field) => {
    if (!errors[field.name] && !isEmpty(values[field.name])) {
      applyCustomRules(field, values[field.name], values, errors, requestType);
    }
  });

  // 3. Global Logic Validation
  applyCrossFieldRules(values, errors, requestType);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}