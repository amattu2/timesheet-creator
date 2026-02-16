"use client";

import { styled, Typography } from "@mui/material";
import Link from "next/link";

const StyledFooter = styled("footer")(({ theme }) => [
  {
    padding: theme.spacing(2, 0),
    marginTop: "auto",
    textAlign: "center",
    borderTop: "1px solid",
    backgroundColor: theme.palette.grey[300],
    borderTopColor: theme.palette.divider,
  },
  theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[900],
    borderTopColor: "transparent",
  }),
]);

const StyledTypography = styled(Typography)(({ theme }) => [
  {
    color: theme.palette.text.primary,
    "& a": {
      color: "inherit",
    },
  },
  theme.applyStyles("dark", {
    color: theme.palette.getContrastText(theme.palette.grey[900]),
  }),
]);

export const Footer = () => (
  <StyledFooter data-testid="page-footer">
    <StyledTypography variant="body2">
      {"Copyright © "}
      <Link
        href="https://github.com/amattu2"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="footer-link"
      >
        {process.env.NEXT_PUBLIC_APP_NAME}
      </Link>{" "}
      <span data-testid="footer-year">{new Date().getFullYear()}</span>
    </StyledTypography>
  </StyledFooter>
);
