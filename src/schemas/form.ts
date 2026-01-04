import { Dayjs } from "dayjs";
import z from "zod";

export const FORM_SCHEMA = z.object({
  monthYear: z.custom<Dayjs>().refine((date) => date !== null && date.isValid(), "Timesheet period is required"),
  workDays: z.object({
    Monday: z.boolean(),
    Tuesday: z.boolean(),
    Wednesday: z.boolean(),
    Thursday: z.boolean(),
    Friday: z.boolean(),
    Saturday: z.boolean(),
    Sunday: z.boolean(),
  }),
  events: z.array(z.object({
    date: z.custom<Dayjs>().refine((date) => date !== null && date.isValid(), "Event date is required"),
    description: z.string().max(100, { message: "Description must be at most 100 characters" }).default("").optional(),
  })).default([]).optional(),
  employees: z
    .array(
      z.object({
        fullName: z.string().min(1, "Employee name is required"),
      })
    )
    .min(1, "At least one employee is required"),
});

export type FormSchema = z.infer<typeof FORM_SCHEMA>;
