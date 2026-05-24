import ExcelJS from "exceljs/dist/exceljs.min.js";
import { saveAs } from "file-saver";

const handleExportExcel = async (wayList = [], exportColumn = [], exportType) => {  

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Way List");

  // ✅ Define columns and freeze header row
  worksheet.columns = exportColumn.map((col) => {
    const fixedWidths = {
      no: 8,
      outlet: 20,
      customer: 20,
      price: 12,
      deliFee: 12,
      phone: 15,
      township: 15,
      address: 20, 
      remark: 25,
    };
    return {
      ...col,
      width: fixedWidths[col.key] ?? 15,
    };
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const filteredWayList = wayList.filter(way => [1, 2, 3].includes(Number(way.status)));

  const rows = filteredWayList.map((way, index) => {    
    const price = way.itemPrice == 0 ? "" : Number(way.itemPrice ?? "");
    const deli = way.deliFee == 0 ? "" : Number(way.deliFee ?? "");    
    const pkgFee = way.packageFee == 0 ? "" : Number(way.packageFee ?? "");

    return {
      no: index + 1,      
      status: way.status, 
      outlet: [
        way.Outlet?.outletName ?? "",
        way.Outlet?.outletPhone ?? "",
      ].filter(Boolean).join("\n"),      
      outletNameOnly: way.Outlet?.outletName || "", 
      customer: way.Customer?.customerName || "",
      price: price, 
      deliFee: deli, 
      phone: way.Customer?.customerPhone || "",
      township: way.townshipName || "",
      address: way.Customer?.customerAddress || "",      
      remark: way.remark || "",
    };
  });
     
  rows.sort((a, b) => {  
    
    if (exportType === "1") {      
      const townshipA = (a.township || "").toString().toLowerCase();
      const townshipB = (b.township || "").toString().toLowerCase();
      const townshipCompare = townshipA.localeCompare(townshipB, 'mm');
      
      if (townshipCompare !== 0) return townshipCompare;
      
      const customerA = (a.customer || "").toString().toLowerCase();
      const customerB = (b.customer || "").toString().toLowerCase();
      return customerA.localeCompare(customerB, 'mm');

    } else if (exportType === "2") {      
      const outletA = (a.outletNameOnly || "").toString().toLowerCase();
      const outletB = (b.outletNameOnly || "").toString().toLowerCase();
      return outletA.localeCompare(outletB, 'mm');
    }

    return 0;
  });

  rows.forEach((row, index) => {
    row.no = index + 1;
  });

  worksheet.addRows(rows);

  // ✅ Header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF000000" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
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

  // ✅ Data rows styling
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber !== 1) {
      row.height = 45;
      row.eachCell((cell, colNumber) => {
        const colKey = worksheet.columns[colNumber - 1]?.key;

        if (colKey === "price" || colKey === "deliFee") {
          cell.numFmt = '#,##0'; 
        }

        if (colKey === "address" || colKey === "remark") {
          cell.alignment = {
            horizontal: "left",
            vertical: "middle",
            wrapText: true,
          };
        } else if (colKey === "outlet" ) {
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        // Borders
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          border: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  const autoFitKeys = ["address", "remark"];

  // ✅ Auto-fit only the "address" & "remark" column
  autoFitKeys.forEach((key) => {
    const column = worksheet.columns.find((c) => c.key === key);
    if (column) {
      let maxLength = column.header ? column.header.length : 10;
      
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value) {          
          const lines = cell.value.toString().split('\n');
          lines.forEach(line => {
            maxLength = Math.max(maxLength, line.length);
          });
        }
      });
            
      column.width = Math.min(Math.max(maxLength + 4, column.width || 20), 50); 
    }
  });

  // ✅ Page setup: Landscape, fit to one page width, repeat header
  worksheet.pageSetup = {
    orientation: "landscape",
    paperSize: 9, // A4
    fitToPage: true,
    fitToWidth: 1, 
    fitToHeight: 0,
    horizontalCentered: true,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
    printTitlesRow: "1:1",
  };

  worksheet.headerFooter = {
    differentFirst: false,
    differentOddEven: false,
    oddFooter: "&L&D &RPage &P of &N",
  };

  // ✅ Export workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const d = new Date();
  const today = `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
  saveAs(blob, `way-list ( ${today} ).xlsx`);
};

export default handleExportExcel;