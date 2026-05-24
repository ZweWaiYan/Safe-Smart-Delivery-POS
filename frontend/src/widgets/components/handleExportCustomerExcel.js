import ExcelJS from "exceljs/dist/exceljs.min.js";
import { saveAs } from "file-saver";

const ROW_LIMIT = 15;

const handleExportCustomerExcel = async (customerList = [], exportColumn = []) => {
  const workbook = new ExcelJS.Workbook();
  
  // 🔹 Split data into chunks of 15
  for (let i = 0; i < customerList.length; i += ROW_LIMIT) {
    const chunk = customerList.slice(i, i + ROW_LIMIT);
    const sheetIndex = i / ROW_LIMIT + 1;

    const worksheet = workbook.addWorksheet(`Customer List ${sheetIndex}`);

    // ✅ Set columns
    worksheet.columns = exportColumn;

    // ✅ Freeze header
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // ✅ Prepare rows
    const rows = chunk.map((customer, index) => {
    let phone = customer?.customerPhone ?? "";

    // force to string
    phone = String(phone);

    // take only first number
    phone = phone.split("/")[0].trim();    

    return {
      no: i + index + 1,
      name: customer?.customerName || "",
      phone,
      address: customer?.customerAddress || "",
    };
});    

    worksheet.addRows(rows);

    // ✅ Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDCE6F1" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ✅ Data rows styling + auto height
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      let maxLines = 1;

      row.eachCell((cell, colNumber) => {
        const colKey = worksheet.columns[colNumber - 1]?.key;
        const value = cell.value?.toString() || "";

        maxLines = Math.max(maxLines, value.split("\n").length);

        cell.alignment = {
          horizontal: colKey === "address" ? "left" : "center",
          vertical: "top",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      row.height = maxLines * 20;
    });

    // ✅ Auto width
    worksheet.columns.forEach((column) => {
      let maxLength = column.header?.length || 10;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value?.toString() || "";
        maxLength = Math.max(
          maxLength,
          ...value.split("\n").map(v => v.length)
        );
      });

      column.width = maxLength + 2;
    });
  }

  // ✅ Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const d = new Date();
  const today = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  saveAs(blob, `customer-list (${today}).xlsx`);
};

export default handleExportCustomerExcel;
