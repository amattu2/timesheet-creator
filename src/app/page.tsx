import { TimesheetForm } from "@/components/form";
import { generateTimesheetPDF } from "@/utils/pdf";
import { Grid } from "@mui/material";
import { Suspense, useMemo } from "react";

const Page = () => {
  const pdfUrl = useMemo(() => generateTimesheetPDF(), []);

  return (
    <Grid container>
      <Grid size={{ lg: 6, xs: 12 }}>
        <Suspense>
          <TimesheetForm />
        </Suspense>
      </Grid>
      {/* <Grid size={{ lg: 1, xs: 0 }}>
      <Divider orientation="vertical" flexItem>
        {" -> "}
      </Divider>
      </Grid> */}
      <Grid size={{ lg: 6, xs: 12 }}>
        <iframe src={pdfUrl} width="600px" height="600px"></iframe>
      </Grid>
    </Grid>
  );
};

export default Page;
