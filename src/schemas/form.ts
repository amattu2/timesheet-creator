import { Dayjs } from "dayjs";
import z from "zod";

export const FORM_SCHEMA = z.object({
  monthYear: z
    .custom<Dayjs>()
    .refine((date) => date !== null && date.isValid(), "Timesheet period is required"),
  workDays: z
    .object({
      Monday: z.boolean(),
      Tuesday: z.boolean(),
      Wednesday: z.boolean(),
      Thursday: z.boolean(),
      Friday: z.boolean(),
      Saturday: z.boolean(),
      Sunday: z.boolean(),
    })
    .refine((workDays) => Object.values(workDays).some((day) => day), {
      message: "At least one workday must be selected",
    }),
  events: z
    .array(
      z.object({
        date: z
          .custom<Dayjs>()
          // TODO: event must be within the selected monthYear
          .refine((date) => date !== null && date.isValid(), "Event date is required"),
        description: z.string().max(35, "Maximum of 35 characters allowed").default("").optional(),
      })
    )
    .default([])
    .optional(),
  employees: z
    .array(
      z.object({
        fullName: z
          .string()
          .min(1, "Employee name is required")
          .max(50, "Maximum of 50 characters allowed"),
      })
    )
    .min(1, "At least one employee is required"),
});

export type FormSchema = z.infer<typeof FORM_SCHEMA>;
