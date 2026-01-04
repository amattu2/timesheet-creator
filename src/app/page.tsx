"use client";

import { TimesheetForm } from "@/components/form";
import { FormSchema, FORM_SCHEMA } from "@/schemas/form";
import { generateTimesheetPDF } from "@/utils/pdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocalStorage } from 'usehooks-ts'

const DefaultForm: FormSchema = {
    monthYear: dayjs(),
    workDays: {
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: false,
    },
    events: [],
    employees: [{ fullName: "" }],
  }

const CachedForm: Pick<FormSchema, "workDays" | "employees"> = {
  workDays: DefaultForm.workDays,
  employees: DefaultForm.employees,
}

const Page = () => {
  const [prevForm, setPrevForm] = useLocalStorage<typeof CachedForm>('previous-form', CachedForm)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const methods = useForm<FormSchema>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      ...DefaultForm,
      ...prevForm,
    },
  });

  const onSubmit = (data: FormSchema) => {
    const pdfDataUrl = generateTimesheetPDF(data);
    setPdfUrl(pdfDataUrl);
    setPrevForm({
      workDays: data.workDays,
      employees: data.employees,
    });
  };

  return (
    <Grid container>
      <Grid size={{ lg: 6, xs: 12 }}>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <TimesheetForm />
          </Box>
        </FormProvider>
      </Grid>
      <Grid size={{ lg: 6, xs: 12 }}>
        {pdfUrl && <iframe src={pdfUrl} width="100%" height="100%" />}
      </Grid>
    </Grid>
  );
};

export default Page;
