import { Typography, Chip, IconButton, Tooltip } from "@material-tailwind/react";
import { mainHeaders, statusList, wayTypeList, mmRegions } from "../../data/local-data";


export const renderCell = (key, header, item, className, tableHeaders, townShipList, isMainWayTable, setStatusDialog, handleWayEdit, openDeleteConfirmDialog, StatusDialogOpen, handleCalculateTotal, canEdit, canDelete, handleOpenHistory) => {
    const {
        wayId, itemPrice, deliFee, status, itemQty, wayType, pickupDeliCarNo,
        senderDeliCarNo, wayDate, remark, complaint, marketName, townShipId, city, townshipName, updatedDate,
        Customer, Outlet
    } = item;
    const { customerName, customerPhone, customerAddress } = Customer || {};
    const { outletName, outletPhone, outletAddress } = Outlet || {};

    switch (header) {

        case "No":
            return (
                <td className={className}>
                    <Typography className="text-sm font-semibold text-center">
                        {key + 1}
                    </Typography>
                </td>
            );

        case "outlet":
            return (
                <td className={`${className} mr-3`}>
                    <Tooltip
                        content={
                            <div className="text-white text-sm rounded-md px-2 py-1 space-y-2">
                                <p>{wayTypeList.find((s) => s.value === wayType)?.label} Info</p>
                                <p>လိပ်စာ : {outletAddress} - {marketName}</p>
                                {wayType === 1 ? <p>ယူမည့်ကား : {pickupDeliCarNo}</p> : ""}
                            </div>
                        }
                    >
                        <div>
                            <Typography className="text-sm font-semibold text-center mb-2">
                                {outletName}
                            </Typography>
                            <Typography className="text-sm font-semibold text-center">
                                {outletPhone}
                            </Typography>
                        </div>
                    </Tooltip>
                </td>
            );

        case "customer":
            return (
                <td className={`${className} ml-3`}>
                    <Tooltip
                        content={
                            <div className="text-white text-sm rounded-md px-2 py-1 space-y-2">
                                <p>Customer Info</p>
                                <p>လိပ်စာ : {customerAddress}</p>
                                <p>ပို့မည့်ကား : {senderDeliCarNo}</p>
                                <p>{townshipName} , {mmRegions.find((d) => d.regionId === city).regionName}</p>
                            </div>
                        }
                    >
                        <div>
                            <Typography className="text-sm font-semibold text-center mb-2">
                                {customerName}
                            </Typography>
                            <Typography className="text-sm font-semibold text-center">
                                {customerPhone}
                            </Typography>
                        </div>
                    </Tooltip>
                </td>
            );

        case "package Fee":
            return (
                <td className={className}>
                    <Typography className="text-sm font-semibold text-center">
                        {Number(itemPrice).toLocaleString()}
                    </Typography>
                </td>
            );

        case "deli Fee":
            return (
                <td className={className}>
                    <Typography className="text-sm font-semibold text-center">
                        {Number(deliFee).toLocaleString()}
                    </Typography>
                </td>
            );

        // case "package Fee":
        //     return (
        //         <Tooltip
        //             content={
        //                 <div className="text-white text-sm rounded-md px-2 py-1 space-y-2">
        //                     <p>Customer Info</p>
        //                     <p>Deli Fee : {deliFee}</p>
        //                     <p>Item Price : {itemPrice}</p>
        //                 </div>
        //             }
        //         >
        //             <td className={className}>
        //                 <div>
        //                     <Typography className="text-sm font-semibold text-center">
        //                         {deliFee + itemPrice}
        //                     </Typography>
        //                 </div>
        //             </td>
        //         </Tooltip>
        //     )


          case "status": {
            

            const currentLabel = statusList.find((s) => s.value === status)?.label;

            const dateObj = updatedDate ? new Date(updatedDate) : null;

            // Date format (07/05/2026)
            const formattedDate = dateObj
                ? dateObj.toLocaleDateString('en-GB')
                : "-";

            // Time format (06:30 AM) - seconds မပါ၊ am/pm ကို အကြီးပြောင်းထားတယ်
            const formattedTime = dateObj
                ? dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).toUpperCase()
                : "";


            return (
                <td className={`${className} relative group`}>
                    <Chip
                        variant="gradient"
                        color={{
                            Pickup: "blue",
                            Pending: "amber",
                            Return: "red",
                            "Date Changed": "pink",
                            "On Way": "cyan",
                            Delivered: "green",
                        }[currentLabel] || "blue-gray"}
                        value={currentLabel}
                        className="py-0.5 px-0.5 mx-2 h-7 text-[12px] font-bold text-center text-white cursor-pointer"
                        onClick={() => StatusDialogOpen(status, wayId, complaint, updatedDate , wayDate)}
                    />



                    {updatedDate && currentLabel !== "Pickup" && (
                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-1 
                    hidden group-hover:block bg-gray-900 text-white text-xs rounded 
                    py-2 px-3 whitespace-nowrap shadow-lg pointer-events-none">

                            {/* Main Wrapper: ဘယ်ဘက်ခြမ်း (Date/Time) နဲ့ ညာဘက်ခြမ်း (Reason) ကို အလယ်တည့်တည့် ညှိပေးထားပါတယ် */}
                            <div className="flex items-center gap-3">

                                {/* ဘယ်ဘက်ခြမ်း: Date နဲ့ Time ကို အပေါ်အောက် ထားရှိခြင်း */}
                                <div className="flex flex-col items-center justify-center leading-none">
                                    <Typography className="text-xs font-bold bg-gray-900 text-gray-400 mb-1 leading-none">
                                        {formattedDate}
                                    </Typography>
                                    <Typography className="text-sm font-bold bg-gray-900 text-white leading-none">
                                        {formattedTime}
                                    </Typography>
                                </div>

                                {/* အလယ်က ဒေါင်းလိုက်လိုင်းတား: Date/Time block ရဲ့ အမြင့်အတိုင်း အလယ်တည့်တည့်မှာ ရှိနေပါမယ် */}
                                {currentLabel === "Pending" && complaint && (
                                    <div className="h-7 border-l border-gray-700 self-center" />
                                )}

                                {/* ညာဘက်ခြမ်း: Reason စာသား (Main Wrapper ရဲ့ items-center ကြောင့် အလယ်တည့်တည့် ကွက်တိ ဖြစ်နေပါမည်) */}
                                {currentLabel === "Pending" && complaint && (
                                    <Typography className="text-sm font-medium text-amber-400 leading-none">
                                        Reason : {complaint}
                                    </Typography>
                                )}

                            </div>
                        </div>
                    )}
                </td>
            );
        }


        case "itemQty":
            return (
                <td className={className}>
                    <Typography className="text-sm font-semibold text-center">
                        {itemQty}
                    </Typography>
                </td>
            );

        // case "wayType":
        //     return (
        //         <td className={className}>
        //             <Typography className="text-sm font-semibold text-center">
        //                 {wayTypeList.find((s) => s.value === wayType)?.label}
        //             </Typography>
        //         </td>
        //     );

        case "wayDate":
            const dateObj = wayDate ? new Date(wayDate) : null;

            // Date format (07/05/2026)
            const formattedDate = dateObj
                ? dateObj.toLocaleDateString('en-GB')
                : "-";

            // Time format (06:30 AM) - seconds မပါ၊ am/pm ကို အကြီးပြောင်းထားတယ်
            const formattedTime = dateObj
                ? dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).toUpperCase()
                : "";

            return (
                <td className={`${className} min-w-[120px]`}>
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <Typography className="text-xs font-medium text-gray-600">
                            {formattedDate}
                        </Typography>
                        <Typography className="text-sm font-bold text-blue-gray-900">
                            {formattedTime}
                        </Typography>
                    </div>
                </td>
            );

        case "remark":
            return (
                <td className={`${className} min-w-[130px] max-w-[130px]`}>
                    <Typography className="text-sm font-semibold text-center">
                        {remark}
                    </Typography>
                </td>
            );

        case "townshipName":
            return (
                <td className={`${className} min-w-[130px] max-w-[130px]`}>
                    <Typography className="text-sm font-semibold text-center">
                        {townshipName}
                    </Typography>
                </td>
            );

        case "deliCar":
            return (
                <td className={className}>
                    <Typography className="text-sm font-semibold text-center">
                        {townshipName}
                    </Typography>
                </td>
            );

        case "Action":
            return (
                <td className={className}>
                    <div
                        className={`flex gap-2 justify-center px-5 ${tableHeaders === mainHeaders ? "flex-col" : "flex-row"
                            }`}
                    >
                        <div className={`flex ${tableHeaders !== mainHeaders ? "flex-col" : "flex-row"} gap-2`}>
                            {
                                tableHeaders === mainHeaders && (
                                    <IconButton color="orange" onClick={() => handleOpenHistory(wayId)}>
                                        <i className="fas fa-route" />
                                    </IconButton>
                                )
                            }
                            {canEdit && (
                                <IconButton color="green" onClick={() => handleWayEdit(wayId)}>
                                    <i className="fas fa-edit" />
                                </IconButton>
                            )}
                            {canDelete && (
                                <IconButton color="red" onClick={() => openDeleteConfirmDialog(wayId)}>
                                    <i className="fas fa-trash" />
                                </IconButton>
                            )}
                        </div>
                        {/* {isMainWayTable && (
                            <IconButton color="blue" onClick={() => handleCalculateTotal(wayId)}>
                                <i className="fas fa-calculator" />
                            </IconButton>
                        )} */}
                    </div>
                </td>
            );

        default:
            return <td className={className}>-</td>;
    }
};