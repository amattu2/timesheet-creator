"use client";

import { Container, styled, Typography } from "@mui/material";
import Link from "next/link";

const StyledFooter = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2, 0),
  marginTop: "auto",
  backgroundColor: theme.palette.grey[900],
  textAlign: "center",
}));

export const Footer = () => (
  <StyledFooter>
    <Container maxWidth="lg">
      <Typography variant="body2">
        {"Copyright © "}
        <Link href="https://github.com/amattu2">{process.env.NEXT_PUBLIC_APP_NAME}</Link>{" "}
        {new Date().getFullYear()}
      </Typography>
    </Container>
  </StyledFooter>
);
