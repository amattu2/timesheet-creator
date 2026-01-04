import { FormSchema } from "@/schemas/form";
import jsPDF from "jspdf";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

type DayRow = {
  /**
   * The date of the specific row
   */
  date: Dayjs;
  /**
   * The date of the specific row represented as a week day string (e.g., Monday, Tuesday, etc.)
   */
  weekDay: string;
  /**
   * A boolean flag indicating if this day allows billable hours.
   * Derived from workDays and Events.
   */
  isBillable: boolean;
  /**
   * An optional description or note to include for the day
   */
  description: string;
};

type Week = { days: DayRow[] };

/**
 * Generates an array of weeks, each containing DayRow objects for the specified period.
 *
 * @param period - The period (month) for which to generate weeks
 * @param workDays - The work days configuration indicating which days allow billable hours
 * @param events - The list of events affecting the timesheet
 * @returns An array of Week objects representing the weeks in the specified period
 */
const buildWeeks = (
  period: Dayjs,
  workDays: FormSchema["workDays"],
  events: FormSchema["events"]
): Week[] => {
  const start = period.startOf("month");
  const weeks: Week[] = [];
  let currentWeek: DayRow[] = [];

  for (let i = 0; i < period.daysInMonth(); i++) {
    const date = start.add(i, "day");
    const weekDay = date.format("dddd") as keyof typeof workDays;

    const event = events?.find((e) => e.date.isSame(date, "day"));
    currentWeek.push({
      date,
      weekDay,
      description: event?.description ?? "",
      isBillable: event ? false : workDays[weekDay],
    });

    const isEndOfWeek = date.day() === 0;
    if (isEndOfWeek && currentWeek.length) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  }

  if (currentWeek.length) {
    weeks.push({ days: currentWeek });
  }

  return weeks;
};

/**
 * A helper function to draw a table cell in the PDF document.
 *
 * @param doc - The jsPDF document instance
 * @param x - The x-coordinate of the top-left corner of the cell
 * @param y - The y-coordinate of the top-left corner of the cell
 * @param w - The width of the cell
 * @param h - The height of the cell
 * @param text - The text content to be displayed inside the cell
 * @param options - Optional settings for cell alignment, fill, border, and font style
 */
const drawCell = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  options?: {
    align?: "L" | "C" | "R";
    fill?: boolean;
    border?: boolean;
    fontStyle?: "normal" | "bold" | "italic";
  }
) => {
  if (options?.fill) {
    doc.setFillColor(210, 210, 210);
    doc.rect(x, y - h + 0.1, w, h, "F");
  }
  if (options?.border !== false) {
    doc.rect(x, y - h + 0.1, w, h, "S");
  }

  const align = options?.align ?? "L";
  const offsetX = align === "C" ? x + w / 2 : align === "R" ? x + w - 1.5 : x + 1.5;
  const textAlign = align === "C" ? "center" : align === "R" ? "right" : "left";

  if (options?.fontStyle) {
    doc.setFont("Helvetica", options.fontStyle);
  } else {
    doc.setFont("Helvetica", "normal");
  }

  doc.text(text, offsetX, y - h / 2 + 2, { align: textAlign });
};

/**
 * A utility function to generate a timesheet PDF from the provided form data.
 *
 * @param data - The form data used to generate the timesheet PDF
 * @returns A data URL string representing the generated PDF
 */
export const generateTimesheetPDF = (data: FormSchema): string => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "letter",
  });

  const monthLabel = data.monthYear.format("MMMM, YYYY");
  const width = doc.internal.pageSize.getWidth() - 20;
  const colWidth = width / 6;
  const headerHeights = {
    title: 10,
    meta: 7,
    tableHeader: 7,
    row: 7.1,
  };

  doc.setProperties({
    title: `${monthLabel} Timesheet`,
    subject: `Timesheet export for pay period ${monthLabel}`,
    author: process.env.NEXT_PUBLIC_COMPANY_NAME,
    creator: process.env.NEXT_PUBLIC_APP_NAME,
    keywords: `PDF, Confidential, Employee Timesheet, ${process.env.NEXT_PUBLIC_APP_NAME} for ${process.env.NEXT_PUBLIC_COMPANY_NAME}`,
  });

  const weeks = buildWeeks(data.monthYear, data.workDays, data.events);
  data.employees.forEach((employee, employeeIndex) => {
    if (employeeIndex > 0) {
      doc.addPage("letter", "p");
    }

    let y = 10 + headerHeights.title;

    doc.setLineWidth(0.3);

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.text(process.env.NEXT_PUBLIC_COMPANY_NAME || "", 10, y);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(15);
    doc.text(`Timesheet | ${monthLabel}`, doc.internal.pageSize.getWidth() - 10, y, {
      align: "right",
    });

    y += 5 + headerHeights.meta;

    // Employee and Period Info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    drawCell(doc, 10, y, colWidth * 4.2, headerHeights.meta, `Employee: ${employee.fullName}`, {
      align: "L",
    });
    drawCell(
      doc,
      colWidth * 4.2 + 10,
      y,
      colWidth * 1.8,
      headerHeights.meta,
      `Pay Period: ${monthLabel}`,
      { align: "L" }
    );

    // Table header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    const headers: Array<{ label: string; width: number; align?: "L" | "C" | "R" }> = [
      { label: "Date", width: colWidth * 0.5, align: "C" },
      { label: "Day of Week", width: colWidth * 0.8, align: "L" },
      { label: "Work or Description", width: colWidth * 2.5, align: "C" },
      { label: "Time In", width: colWidth * 0.7, align: "C" },
      { label: "Time Out", width: colWidth * 0.7, align: "C" },
      { label: `Net Days`, width: colWidth * 0.8, align: "C" },
    ];

    let x = 10;
    headers.forEach((h) => {
      drawCell(doc, x, y + headerHeights.tableHeader, h.width, headerHeights.tableHeader, h.label, {
        align: h.align,
        fill: true,
        fontStyle: "bold",
      });
      x += h.width;
    });

    y += headerHeights.tableHeader;

    // Body rows
    doc.setFont("Helvetica");
    doc.setFontSize(9);

    weeks.forEach((week) => {
      week.days.forEach(({ date, weekDay, description, isBillable }) => {
        x = 10;
        drawCell(
          doc,
          x,
          y + headerHeights.row,
          headers[0].width,
          headerHeights.row,
          date.format("DD"),
          { align: "R", fill: !isBillable }
        );
        x += headers[0].width;

        drawCell(doc, x, y + headerHeights.row, headers[1].width, headerHeights.row, weekDay, {
          align: "L",
          fill: !isBillable,
        });
        x += headers[1].width;

        drawCell(
          doc,
          x,
          y + headerHeights.row,
          headers[2].width,
          headerHeights.row,
          description || "",
          {
            align: "L",
            fontStyle: "italic",
            fill: !isBillable,
          }
        );
        x += headers[2].width;

        drawCell(doc, x, y + headerHeights.row, headers[3].width, headerHeights.row, "", {
          fill: !isBillable,
        });
        x += headers[3].width;

        drawCell(doc, x, y + headerHeights.row, headers[4].width, headerHeights.row, "", {
          fill: !isBillable,
        });
        x += headers[4].width;
        drawCell(doc, x, y + headerHeights.row, headers[5].width, headerHeights.row, "", {
          fill: !isBillable,
        });

        y += headerHeights.row;
      });
    });

    // Footer
    x = 10;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    drawCell(doc, x, y + headerHeights.meta, colWidth * 4.5, headerHeights.meta, "", {
      fill: false,
      border: false,
      align: "L",
    });
    drawCell(
      doc,
      x + colWidth * 4.5,
      y + headerHeights.meta,
      colWidth * 1.5,
      headerHeights.meta,
      `Total Days: `,
      { align: "L", fill: true, fontStyle: "bold" }
    );
  });

  return doc.output("datauristring");
};
