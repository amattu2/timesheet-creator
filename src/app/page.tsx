"use client";

import { TimesheetForm } from "@/components/form";
import { FormSchema, FORM_SCHEMA } from "@/schemas/form";
import { generateTimesheetPDF } from "@/utils/pdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const Page = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const methods = useForm<FormSchema>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      // TODO: Load from local storage or defaults
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
    },
  });

  const onSubmit = (data: FormSchema) => {
    const pdfDataUrl = generateTimesheetPDF(data);
    setPdfUrl(pdfDataUrl);
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
