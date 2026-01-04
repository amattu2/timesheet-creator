"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { FORM_SCHEMA, FormSchema } from "@/schemas/form";

const WORK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const TimesheetForm = () => {
  const { control, handleSubmit } = useForm<FormSchema>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      monthYear: dayjs(),
      workDays: {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false,
      },
      holidays: [],
      employees: [{ fullName: "" }],
    },
  });

  const {
    fields: holidayFields,
    append: appendHoliday,
    remove: removeHoliday,
  } = useFieldArray({
    control,
    name: "holidays",
  });

  const {
    fields: employeeFields,
    append: appendEmployee,
    remove: removeEmployee,
  } = useFieldArray({
    control,
    name: "employees",
  });

  const onSubmit = (data: FormSchema) => {
    console.log("Form Data:", data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        {/* Month/Year Section */}
        <Box mb={4}>
          <Typography variant="h6" mb={1}>
            Timesheet Period
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Select the month and year for this timesheet
          </Typography>
          <Controller
            name="monthYear"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ? field.value.toDate() : null}
                onChange={(date) => field.onChange(date ? dayjs(date) : null)}
                views={["year", "month"]}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            )}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Employees Section */}
        <Box mb={4}>
          <Typography variant="h6" mb={1}>
            Employees
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Enter employee names (at least one required)
          </Typography>
          <Stack spacing={2} mb={2}>
            {employeeFields.map((field, index) => (
              <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Controller
                  name={`employees.${index}.fullName`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      placeholder="Full Name"
                      fullWidth
                      size="small"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
                {employeeFields.length > 1 && (
                  <IconButton color="error" size="small" onClick={() => removeEmployee(index)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendEmployee({ fullName: "" })}
            variant="outlined"
            size="small"
          >
            Add Employee
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Work Days Section */}
        <Box mb={4}>
          <Typography variant="h6" mb={1}>
            Working Days
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Select which days of the week are working days
          </Typography>
          <Controller
            name="workDays"
            control={control}
            render={({ field }) => (
              <FormGroup>
                {WORK_DAYS.map((day) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={field.value[day as keyof typeof field.value]}
                        onChange={(e) =>
                          field.onChange({
                            ...field.value,
                            [day]: e.target.checked,
                          })
                        }
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>
            )}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Holidays Section */}
        <Box mb={4}>
          <Typography variant="h6" mb={1}>
            Holidays
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Add holidays observed in this month (optional)
          </Typography>
          <Stack spacing={2} mb={2}>
            {holidayFields.map((field, index) => (
              <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Controller
                  name={`holidays.${index}`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      value={field.value ? field.value.toDate() : null} // Convert Dayjs to Date
                      onChange={(date) => field.onChange(date ? dayjs(date) : null)} // Convert Date back to Dayjs
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  )}
                />
                <IconButton color="error" size="small" onClick={() => removeHoliday(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendHoliday(dayjs())}
            variant="outlined"
            size="small"
          >
            Add Holiday
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Submit Button */}
        <Button type="submit" variant="contained" fullWidth>
          Create Timesheet{employeeFields.length > 1 ? "s" : ""}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};
