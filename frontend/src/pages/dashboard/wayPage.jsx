import {
    Card, CardHeader, CardBody, Typography, Chip, IconButton,
    Input, Select, Option, Dialog, DialogHeader, DialogBody, DialogFooter, Button, Tooltip, Radio,
    Tabs, TabsHeader, TabsBody, Tab, TabPanel, Menu,
    MenuHandler,
    MenuList,
    MenuItem,
} from "@material-tailwind/react";
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState, useRef } from "react";

import { fetchWay, createWay, updateWay, deleteWay, updateStatusOnly, updateAllStatusToday } from "@/api/wayAPI";
import { createWayHistory, updateWayHistory, getWayHistory, deleteWayHistory, bulkUpdateWayHistory } from "@/api/wayHistoryAPI";
import { fetchOutlet, createOutlet } from "@/api/outletAPI";
import { fetchCustomers, createCustomer } from "@/api/customerAPI";
import { fetchMarket } from "@/api/marketAPI";
import { fetchDeliArea } from "@/api/deliAreaAPI";
import { fetchTownShip } from "@/api/townShipAPI";

import handleExportExcel from "@/widgets/components/handleExportExcel";
import { handleExportPdf } from "@/widgets/components/handleExportPdf";

import { Bars3Icon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

import { mainHeaders, outletHeaders, osHeaders, mmRegions, wayTypeList, statusList, filterOrderTypeTabLists } from "../../data/local-data";
import { initialWayFormData, resetOSWayFormData, initialOutletFormData, initialCustomerFormData, initialFilterFormDate, resetOutletWayFormData, exportColumns } from "../../data/initialForm-data";
import { renderCell } from "@/widgets/components/helperComponents";
import { StatusDialog } from "../../widgets/components/statusDialog";
import { useLocation } from "react-router-dom";

import remainWay from "../../assets/wayPage/remainWay.png";
import doneSign from "../../assets/wayPage/doneSign.png";
import excel from "../../assets/wayPage/excel.png";
import delivery from "../../assets/wayPage/delivery.png";
import office from "../../assets/wayPage/office.png";
import pdf from "../../assets/wayPage/pdf.png";

import toast from "react-hot-toast";

import { usePermission } from "@/hooks/usePermission";
import { number } from "prop-types";

export function WayPage() {

    const { canAdd, canEdit, canDelete } = usePermission("Way");


    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;

    const [wayList, setWayList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [isMainWayTable, setMainWayTable] = useState(true);

    const [marketList, setMarketList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [deliAreaList, setDeliAreaList] = useState([]);
    const [outletList, setOutletList] = useState([]);
    const [townShipList, setTownShipList] = useState([]);

    const [formData, setFormData] = useState(initialWayFormData);
    const [mainFormData, setMainFormData] = useState(initialWayFormData);
    const [outletFormData, setOutletFormData] = useState(initialOutletFormData);
    const [customerFormData, setCustomerFormData] = useState(initialCustomerFormData);
    const [filterFormData, setFilterFormData] = useState(initialFilterFormDate);

    const [tableHeaders, setTableHeaders] = useState(mainHeaders);

    const [outletDialog, setOutletDialog] = useState(false);
    const [customerDialog, setCustomerDialog] = useState(false);
    const [isOrderTypeNew, setIsOrderTypeNew] = useState(false);
    const [orderTypeDialog, setOrderTypeDialog] = useState(false);
    const [statusDialog, setStatusDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [calculateDialog, setCalculateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isFiltered, setIsFiltered] = useState(null);
    const [editStatusId, setEditStatusId] = useState({ statusId: 0, wayId: 0, complaint: "", wayDateItem: "" });

    const [matchingCars, setMatchingCars] = useState([]);
    const [navStatus, setNavStatus] = useState(0);

    const [historyList, setHistoryList] = useState([]);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [deliveryDialog, setDeliveryDialog] = useState(false);
    const [localStartDate, setLocalStartDate] = useState("");

    const [orderTypeErrors, setOrderTypeErrors] = useState({ marketName: "", outletName: "", pickupDeliCar: "" });
    const [wayErrors, setWayErrors] = useState({ outletId: "", customerId: "", itemPrice: "", deliFee: "", itemQty: "", city: "", townShipId: "", wayDate: "" });
    const [outletErrors, setOutletErrors] = useState({ outletName: "", outletPhone: "", outletAddress: "" });
    const [customerErrors, setCustomerErrors] = useState({ customerName: "", customerPhone: "", customerAddress: "" });

    const [errors, setErrors] = useState("");

    const [filterBy, setFilterBy] = useState("0");

    const outletInputRef = useRef(null);
    const customerInputRef = useRef(null);
    const itemPriceInputRef = useRef(null);
    const deliFeeInputRef = useRef(null);
    const cityInputRef = useRef(null);
    const townShipInputRef = useRef(null);
    const itemQtyInputRef = useRef(null);
    const wayDateInputRef = useRef(null);
    const remarkInputRef = useRef(null);

    const outletNameRef = useRef(null);
    const outletPhoneRef = useRef(null);
    const outletAddressRef = useRef(null);
    const outletTypeRef = useRef(null);

    const customerNameRef = useRef(null);
    const customerPhoneRef = useRef(null);
    const customerAddressRef = useRef(null);

    const location = useLocation();

    const topRef = useRef(null);


    useEffect(() => {
        fetchFunc(fetchWay, setFilteredList, "Way");
        fetchFunc(fetchWay, setWayList, "Way");
        fetchFunc(fetchCustomers, setCustomerList, "Customer");
        fetchFunc(fetchOutlet, setOutletList, "Outlet");
        fetchFunc(fetchMarket, setMarketList, "Market");
        fetchFunc(fetchDeliArea, setDeliAreaList, "DeliArea");
        fetchFunc(fetchTownShip, setTownShipList, "TownShip");

        if (location.state !== null) {

            // const fromDashboard = location.state?.fromDashboard ?? false;

            const matchedStatus = statusList.find(
                (status) => status.label == location.state?.statusName
            );

            const statusValue = matchedStatus ? matchedStatus.value : 0;



            setNavStatus(statusValue);
        }
    }, []);

    // Fetch Data
    const fetchFunc = async (fetchFn, setStateFn, label = "") => {
        try {
            const data = await fetchFn();

            let allOption = {};
            let newData = [];

            switch (label) {
                case "TownShip":
                    allOption = { townShipId: 0, townShipName: "All" };
                    newData = [allOption, ...data];
                    break;
                case "DeliArea":
                    allOption = { deliAreaId: 0, deliCarNo: "All", townShipIds: [], townShipNames: [] };
                    newData = [allOption, ...data];
                    break;
                case "Market":
                    allOption = { marketId: 0, marketName: "All" };
                    newData = [allOption, ...data];
            }

            setStateFn(label === "TownShip" || label === "DeliArea" || label === "Market" ? newData : data);
        } catch (error) {
            console.error(error);
        }

    };

    // Verify Order Type
    const verifyOrderTypeInputs = () => {
        let valid = true;
        const newErrors = { customerName: "", outletName: "", pickupDeliCar: "" };

        if (formData.wayType === 0) {
            if (!formData.marketName || formData.marketName.trim() === "") {
                newErrors.marketName = "Market Name is required";
                valid = false;
            }
        } if (formData.wayType === 1) {
            if (!formData.outletId || formData.outletId === 0) {
                newErrors.outletName = "Customer Name is required";
                valid = false;
            }
            if (!formData.pickupDeliCar || formData.pickupDeliCar === 0) {
                newErrors.pickupDeliCar = "Pickup Car is required";
                valid = false;
            }
        }


        setOrderTypeErrors(newErrors);
        return valid;
    };


    // Verify Way
    const verifyWayInputs = () => {
        let valid = true;
        const newErrors = { outletId: "", customerId: "", itemPrice: "", deliFee: "", itemQty: "", city: "", townShipId: "", wayDate: "" };

        if (!formData.outletId || formData.outletId === 0) {
            newErrors.outletId = "Outlet is required";
            valid = false;
        }
        if (!formData.customerId || formData.customerId === 0) {
            newErrors.customerId = "Customer is required";
            valid = false;
        }
        // if (!formData.itemPrice || formData.itemPrice === 0) {
        //     newErrors.itemPrice = "Item Price is required";
        //     valid = false;
        // }
        // if (!formData.deliFee || formData.deliFee === 0) {
        //     newErrors.deliFee = "Deli Fee is required";
        //     valid = false;
        // }
        // if (!formData.itemQty || formData.itemQty === 0) {
        //     newErrors.itemQty = "ItemQty is required";
        //     valid = false;
        // }
        // if (!formData.city || formData.city === 0) {
        //     newErrors.city = "City is required";
        //     valid = false;
        // }
        if (!formData.townShipId || formData.townShipId === 0) {
            newErrors.townShipId = "townShipId is required";
            valid = false;
        }
        // if (!formData.wayDate || formData.wayDate === "") {
        //     newErrors.wayDate = "wayDate is required";
        //     valid = false;
        // }

        setWayErrors(newErrors);
        return valid;
    }

    const verifyMainWayInputs = () => {
        let valid = true;
        const newErrors = { outletId: "", customerId: "", itemPrice: "", deliFee: "", itemQty: "", city: "", townShipId: "", wayDate: "" };

        if (!mainFormData.outletId || mainFormData.outletId === 0) {
            newErrors.outletId = "Outlet is required";
            valid = false;
        }
        if (!mainFormData.customerId || mainFormData.customerId === 0) {
            newErrors.customerId = "Customer is required";
            valid = false;
        }
        // if (!mainFormData.itemPrice || mainFormData.itemPrice === 0) {
        //     newErrors.itemPrice = "Item Price is required";
        //     valid = false;
        // }
        // if (!mainFormData.deliFee || mainFormData.deliFee === 0) {
        //     newErrors.deliFee = "Deli Fee is required";
        //     valid = false;
        // }
        // if (!mainFormData.itemQty || mainFormData.itemQty === 0) {
        //     newErrors.itemQty = "ItemQty is required";
        //     valid = false;
        // }
        // if (!mainFormData.city || mainFormData.city === 0) {
        //     newErrors.city = "City is required";
        //     valid = false;
        // }
        if (!mainFormData.townShipId || mainFormData.townShipId === 0) {
            newErrors.townShipId = "townShipId is required";
            valid = false;
        }
        // if (!mainFormData.wayDate || mainFormData.wayDate === "") {
        //     newErrors.wayDate = "wayDate is required";
        //     valid = false;
        // }

        setWayErrors(newErrors);
        return valid;
    }

    const [currentPage, setCurrentPage] = useState(1);

    const getPageNumbers = (current, total) => {
        const pages = [];
        const showMax = 2; // current page ရဲ့ ဘေးတစ်ဖက်တစ်ချက်မှာ ပြချင်တဲ့ အရေအတွက်

        for (let i = 1; i <= total; i++) {
            // အမြဲတမ်းပြမယ့် page များ: ပထမစာမျက်နှာ၊ နောက်ဆုံးစာမျက်နှာ နှင့် current page ဝန်းကျင်
            if (
                i === 1 ||
                i === total ||
                (i >= current - showMax && i <= current + showMax)
            ) {
                pages.push(i);
            } else if (
                i === current - showMax - 1 ||
                i === current + showMax + 1
            ) {
                // "..." ထည့်ရန်
                pages.push("...");
            }
        }

        // "..." တွေ ထပ်နေရင် ဖယ်ထုတ်ပေးခြင်း
        return pages.filter((item, index) => pages.indexOf(item) === index);
    };

    // Verify Customer
    const verifyCustomerInputs = () => {

        let valid = true;
        const customerErrors = { customerName: "", customerPhone: "", customerAddress: "" };

        if (!customerFormData.customerName || outletFormData.customerName === "") {
            customerErrors.customerName = "Customer Name is required";
            valid = false;
        }
        if (!customerFormData.customerPhone || customerFormData.customerPhone === "") {
            customerErrors.customerPhone = "Customer Phone is required";
            valid = false;
        }
        if (!customerFormData.customerAddress || customerFormData.customerAddress === "") {
            customerErrors.customerAddress = "Customer Address is required";
            valid = false;
        }

        setCustomerErrors(customerErrors);
        return valid;
    }

    // Verify Outlet
    const verifyOutletInputs = () => {

        let valid = true;
        const outletErrors = { outletName: "", outletPhone: "", outletAddress: "" };

        if (!outletFormData.outletName || outletFormData.outletName === "") {
            outletErrors.outletName = "outlet Name is required";
            valid = false;
        }
        if (!outletFormData.outletPhone || outletFormData.outletPhone === "") {
            outletErrors.outletPhone = "outlet Phone is required";
            valid = false;
        }
        if (!outletFormData.outletAddress || outletFormData.outletAddress === "") {
            outletErrors.outletAddress = "outlet Address is required";
            valid = false;
        }

        setOutletErrors(outletErrors);
        return valid;
    }

    // handle order type
    const handleOrderTypeSubmit = (value) => {

        //if this func called from Cancel Btn of Order Type Dialog
        if (value === "0") {
            handleInputChange({
                wayType: 0, marketName: "", outletId: 0, pickupDeliCar: ""
            });

            setFilteredList(wayList);
        } else {
            if (!verifyOrderTypeInputs()) return;

            setIsOrderTypeNew(true);

            if (formData.marketName !== "" && formData.wayType === 0) {
                setMainWayTable(false);
                setTableHeaders(outletHeaders);
            } else if (formData.pickupDeliCar !== 0 && formData.wayType === 1) {
                setMainWayTable(false);
                setTableHeaders(osHeaders);
            } else {
                setTableHeaders(mainHeaders);
            }
        }

        setOrderTypeDialog(!orderTypeDialog);
    };

    // handle Filter Change
    const handleFilterInputChange = (e) => {
        const { value, name } = e.target;
        setIsFiltered(true);
        setFilterFormData({ ...filterFormData, [name]: value });
    }


    // Handle Way Change
    const handleInputChange = (e) => {
        if (e?.target) {
            // normal input change
            const { name, value } = e.target;
            isMainWayTable ? setMainFormData((prev) => ({ ...prev, [name]: value })) : setFormData((prev) => ({ ...prev, [name]: value }));
        } else {
            // direct object update        
            isMainWayTable ? setMainFormData((prev) => ({ ...prev, ...e })) : setFormData((prev) => ({ ...prev, ...e }));
        }
    };

    // Handle Order Type Change
    const handleOrderTypechange = (e) => {
        if (e?.target) {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setOrderTypeErrors((prev) => ({ ...prev, [name]: "" }));
        } else {
            setFormData((prev) => ({ ...prev, ...e }));
            setOrderTypeErrors({
                marketName: "",
                outletName: "",
                pickupDeliCar: ""
            });
        }
    };


    // Handle Outlet Change
    const handleOutletInputChange = (e) => {
        if (e?.target) {
            // normal input change
            const { name, value } = e.target;
            setOutletFormData((prev) => ({ ...prev, [name]: value }));
        } else {
            // direct object update
            setOutletFormData((prev) => ({ ...prev, ...e }));
        }
    };


    // Handle Customer Change
    const handleCustomerInputChange = (e) => {
        if (e?.target) {
            // normal input change
            const { name, value } = e.target;
            setCustomerFormData((prev) => ({ ...prev, [name]: value }));
        } else {
            // direct object update
            setCustomerFormData((prev) => ({ ...prev, ...e }));
        }
    };

    // Way Save / Edit
    const handleWaySave = async () => {

        if (isMainWayTable === true) {
            if (!verifyMainWayInputs()) return;
        } else {
            if (!verifyWayInputs()) return;
        }

        try {


            let response;
            if (editId) {

                response = await updateWay(editId, isMainWayTable === true ? mainFormData : formData);

                if (response.status === 201) {
                    setFilteredList((prev) =>
                        prev.map((row) =>
                            row.wayId === editId ? response.data : row
                        )
                    );
                    handleResetForm("0");
                    setEditDialog(false);
                    toast.success(response.message);
                } else {
                    toast.error("Failed to update. Please try again.");
                }
            } else {

                const now = new Date();
                const offset = now.getTimezoneOffset() * 60000;
                const localISOTime = new Date(now - offset).toISOString().slice(0, 19).replace('T', ' ');

                formData.wayDate = localISOTime;
                formData.itemQty = 1;

                if (formData.city === 0) {
                    formData.city = 1;
                }

                response = await createWay(formData);

                if (response.status === 201) {

                    const initialHistory = [
                        {
                            status: formData.status,
                            changed_at: formData.status === 1 ? formData.wayDate : formData.updateWay,
                            complaint: formData.complaint || ""
                        }
                    ];


                    const requestBody = {
                        wayId: response.data['wayId'],
                        historyData: initialHistory
                    };

                    await createWayHistory(requestBody);

                    setFilteredList((prev) => [response.data, ...prev]);
                    handleResetForm("0");
                    setEditDialog(false);
                    toast.success(response.message);
                } else {
                    toast.error("Failed to save. Please try again.");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong!");
        }
    };

    // Way Delete
    const handleWayDelete = async () => {
        try {
            const response = await deleteWay(deleteId);
            const responseHistory = await deleteWayHistory(deleteId);
            setFilteredList((prev) => prev.filter((c) => c.wayId !== deleteId));
            setDeleteId(null);
            setConfirmDeleteDialog(false);
            toast.success(response.message);
        } catch (err) {
            toast.error("Something went wrong!");
        }
    }


    // Way Edit set to Input
    const handleWayEdit = (id) => {

        const item = filteredList.find((d) => d.wayId === id);
        if (!item) return;

        tableHeaders.length === 10 && setEditDialog(true);

        isMainWayTable === true ?
            setMainFormData({
                outletId: item.outletId, customerId: item.customerId, itemPrice: item.itemPrice, deliFee: item.deliFee, status: item.status, itemQty: item.itemQty, wayType: item.wayType, marketName: item.marketName, pickupDeliCar: item.pickupDeliCar, senderDeliCar: item.senderDeliCar, city: item.city, townShipId: item.townShipId, wayDate: item.wayDate, remark: item.remark, complaint: item.complaint,
            })
            :
            setFormData({
                outletId: item.outletId, customerId: item.customerId, itemPrice: item.itemPrice, deliFee: item.deliFee, status: item.status, itemQty: item.itemQty, wayType: item.wayType, marketName: item.marketName, pickupDeliCar: item.pickupDeliCar, senderDeliCar: item.senderDeliCar, city: item.city, townShipId: item.townShipId, wayDate: item.wayDate, remark: item.remark, complaint: item.complaint,
            });

        setEditId(id);

        //  smooth scroll to top
        topRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        //  focus input after scroll
        // setTimeout(() => {
        //     townShipNameRef.current?.focus();
        // }, 300);
    }

    const activeFilters = Object.keys(filterFormData).reduce((acc, key) => {


        const currentValue = filterFormData[key];
        const defaultValue = initialFilterFormDate[key];

        if (currentValue != defaultValue && currentValue !== "" && currentValue !== null) {
            acc[key] = currentValue;
        }
        return acc;
    }, {});

    // handle filter
    const handleFilter = () => {
        const { customer, outletName, startDate, endDate, status, townShip, senderDeliCar, sortBy, city, wayType, market, packageFee, startOfficeDate, endOfficeDate } = filterFormData;

        if (filterFormData.startDate && filterFormData.endDate) {
            if (new Date(filterFormData.startDate) > new Date(filterFormData.endDate)) {
                alert("Start date cannot be later than End date!");
                return;
            }
        }

        if (filterFormData.startOfficeDate && filterFormData.endOfficeDate) {
            if (new Date(filterFormData.startOfficeDate) > new Date(filterFormData.endOfficeDate)) {
                alert("Start date cannot be later than End date!");
                return;
            }
        }

        let filtered = wayList.filter((item) => {

            //Start Date ~ End Date
            let matchDate = true;
            if (startDate || endDate) {

                const isPickup = Number(item.status) === 1;

                const targetDateStr = isPickup
                    ? (item.wayDate || "")
                    : (item.updatedDate || "");

                const cleanItemDate = targetDateStr ? targetDateStr.replace(' ', 'T').substring(0, 16) : "";

                if (startDate && endDate) {
                    matchDate = cleanItemDate >= startDate && cleanItemDate <= endDate;
                } else if (startDate) {
                    matchDate = cleanItemDate >= startDate;
                } else if (endDate) {
                    matchDate = cleanItemDate <= endDate;
                }

            }

            let matchOfficeDate = true;
            if (startOfficeDate || endOfficeDate) {
                const targetOfficeDataStr = item.wayDate || "";

                const cleanOfficeItemDate = targetOfficeDataStr ? targetOfficeDataStr.replace(' ', 'T').substring(0, 16) : "";



                if (startOfficeDate && endOfficeDate) {
                    matchOfficeDate = cleanOfficeItemDate >= startOfficeDate && cleanOfficeItemDate <= endOfficeDate;
                } else if (startOfficeDate) {
                    matchOfficeDate = cleanOfficeItemDate >= startOfficeDate;
                } else if (endOfficeDate) {
                    matchOfficeDate = cleanOfficeItemDate <= endOfficeDate;
                }
            }

            let matchName = true;
            // Customer            
            if (filterBy === "0") {
                //search by name
                matchName = customer === "" || item.Customer?.customerName?.toLowerCase().includes(customer.toLowerCase());
            } else {
                //search by address
                matchName = customer === "" || item.Customer?.customerAddress?.toLowerCase().includes(customer.toLowerCase());
            }
            // Outlet
            const matchShop = outletName === "" || item.Outlet?.outletName?.toLowerCase().includes(outletName.toLowerCase());
            // Status
            const matchStatus = Number(status) === 0 || item.status === Number(status);
            // TownShip
            const matchTownship = Number(townShip) === 0 || item.townShipId === Number(townShip);
            // Sender DeliCar
            const matchSenderDeliCar = Number(senderDeliCar) === 0 || item.senderDeliCar === Number(senderDeliCar);
            // City
            const matchCity = Number(city) === 0 || item.city === Number(city);
            // WayType
            const matchWayType = Number(wayType) === 3 || item.wayType === Number(wayType);
            // Market
            const matchMarket = Number(market) === 0 || item.marketId === Number(market);
            // Package Fee
            const matchPackageFee = packageFee === "" || Number(packageFee) === 0 || item.itemPrice === Number(packageFee);

            return matchName && matchShop && matchDate && matchStatus && matchTownship && matchSenderDeliCar && matchCity && matchWayType && matchMarket && matchPackageFee && matchOfficeDate;
        });

        // Sorting
        if (sortBy && sortBy !== "" && sortBy !== 0) {
            filtered.sort((a, b) => {
                let valA = "";
                let valB = "";

                if (sortBy.toLowerCase() === "outlet") {
                    valA = a.Outlet?.outletName || "";
                    valB = b.Outlet?.outletName || "";
                } else if (sortBy.toLowerCase() === "customer") {
                    valA = a.Customer?.customerName || "";
                    valB = b.Customer?.customerName || "";
                } else {
                    valA = a[sortBy]?.toString() || "";
                    valB = b[sortBy]?.toString() || "";
                }

                return valA.localeCompare(valB, 'mm');
            });
        }



        setFilteredList([...filtered]);
        setFilterDialog(false);
    };

    // handle cancel filter
    const handleCancelFilter = () => {
        setNavStatus(0);
        setFilterBy("0");
        setFilterFormData(initialFilterFormDate);
        setFilteredList(wayList);
        setIsFiltered(false);
        setFilterDialog(false);
    }

    // Way Confirm Dialog Delete
    const openDeleteConfirmDialog = (id) => {
        setDeleteId(id);
        setConfirmDeleteDialog(true);
    };

    // Outlet Dialog Save
    const handleOutletDialogSave = async () => {

        outletFormData.marketId = formData.marketId;
        outletFormData.marketName = formData.marketName;

        if (!verifyOutletInputs()) return;

        const response = await createOutlet(outletFormData);

        if (response) {

            fetchFunc(fetchOutlet, setOutletList, "Outlet");
            setOutletDialog(false);
            handleResetForm("1");
            tableHeaders.length === 10 && setEditDialog(true);
            handleInputChange({
                outletId: response.data.outletId
            });
        }
    };

    // Outlet Dialog Close
    const handleOutletDialogClose = () => {
        setOutletDialog(false);
        tableHeaders.length === 10 && setEditDialog(true);
        handleResetForm("1"); // optional reset
    };

    // Customer Dialog Save
    const handleCustomerDialogSave = async () => {
        if (!verifyCustomerInputs()) return;

        try {
            const response = await createCustomer(customerFormData);

            if (response) {

                fetchFunc(fetchCustomers, setCustomerList, "Customer");
                setCustomerDialog(false);
                tableHeaders.length === 10 && setEditDialog(true);
                handleResetForm("2");
                setErrors("");

                handleInputChange({
                    customerId: response.data.customerId
                });
            }
        } catch (err) {
            const errorMsg = err.toString() || "Something is wrong";
            setErrors(errorMsg);
        }
    };

    // Customer Dialog Close
    const handleCustomerDialogClose = () => {
        setCustomerDialog(false);
        tableHeaders.length === 10 && setEditDialog(true);
        handleResetForm("2");
        setErrors("");
    };

    // Order Type Dialog Close
    const handleOrderTypeDialogClose = () => {
        if (!orderTypeDialog) {
            setOrderTypeDialog(false);
        }
    }

    // status Dialog Open
    const StatusDialogOpen = (statusId, wayId, complaint, wayDate) => {
        setEditStatusId({ statusId: statusId, wayId: wayId, complaint: complaint, wayDateItem: wayDate });
        setStatusDialog(true);
    };

    // handle status 
    const handleStatusSubmit = async ({ wayId, status, complaint, wayDate }) => {

        try {
            const currentStatus = Number(status);
            const body = { status: currentStatus };

            switch (currentStatus) {
                case 1: // Pickup
                    body.updatedDate = null;
                    body.complaint = "";
                    break;

                case 2: // Date Changed
                    body.updatedDate = wayDate || null;
                    body.complaint = "";
                    break;

                case 3: // Pending
                    body.updatedDate = wayDate || null;
                    body.complaint = complaint || "";
                    break;

                case 4: // Return
                    body.updatedDate = wayDate || null;
                    body.complaint = "";
                    break;

                case 5: // Delivered
                    body.updatedDate = wayDate || null;
                    body.complaint = "";
                    break;

                default:
                    body.updatedDate = null;
                    body.complaint = "";
                    break;
            }

            const result = await updateStatusOnly(wayId, body);

            if (result.status === 201) {

                // fetchFunc(fetchWay, setFilteredList, "Way");
                // fetchFunc(fetchWay, setWayList, "Way");

                const res = await getWayHistory(wayId);

                const now = new Date();

                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');

                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');

                const initialHistory = {
                    status: status,
                    changed_at: status === 1 ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` : wayDate || "",
                    complaint: status === 3 ? complaint || "" : ""
                }

                let updatedHistoryArray = [];

                if (res && res.success && Array.isArray(res.data)) {
                    // Backend က success: true နဲ့ data format အတိုင်း လာရင်
                    updatedHistoryArray = [...res.data, initialHistory];
                } else if (res && Array.isArray(res)) {
                    // တိုက်ရိုက် Array အနေနဲ့ လာရင်
                    updatedHistoryArray = [...res, initialHistory];
                } else {
                    // လုံးဝ ဒေတာမရှိသေးရင် Array အလွတ်ထဲ အသစ်ထည့်မယ်
                    updatedHistoryArray = [initialHistory];
                }

                await updateWayHistory(wayId, updatedHistoryArray);


                // Update local UI
                setFilteredList(prev =>
                    prev.map(item =>
                        item.wayId === wayId
                            ? { ...item, status, complaint: body.complaint ?? item.complaint, updatedDate: body.updatedDate }
                            : item
                    )
                );

                toast.success("Status updated successfully!");
            } else {
                toast.error("Failed to update status. Please try again.");
            }

            setStatusDialog(false); // close dialog
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Status update failed!");
        }
    };

    //Handle Way History Dialog
    const handleOpenHistory = async (id) => {

        if (!id) return;

        setHistoryLoading(true);
        setHistoryDialogOpen(true);

        setTimeout(async () => {
            try {
                const res = await getWayHistory(id);

                if (res) {
                    setHistoryList(res.data || res);
                } else {
                    setHistoryList([]);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
                setHistoryList([]);
            } finally {
                setHistoryLoading(false);
            }
        }, 50);
    };


    const handleTodayAllStatusDelivery = async () => {

        const formattedStartDate = localStartDate ? localStartDate.replace("T", " ") + ":00" : null;
        const wayIdList = filteredList.map(item => item.wayId);

        console.log("wayIdList", wayIdList);

        try {
            const result = await updateAllStatusToday(wayIdList, formattedStartDate);

            if (result.status === 200) {

                setWayList(prevList =>
                    prevList.map(item => {
                        if (wayIdList.includes(item.wayId)) {
                            return { ...item, status: 5, updatedDate: formattedStartDate };
                        }
                        return item;
                    })
                );

                setFilteredList(prevList =>
                    prevList.map(item => {
                        if (wayIdList.includes(item.wayId)) {
                            return { ...item, status: 5, updatedDate: formattedStartDate };
                        }
                        return item;
                    })
                );

                // 💡 ၂။ ID အနည်းဆုံး တစ်ခုပါမှ API လှမ်းခေါ်ပါမည်
                await bulkUpdateWayHistory(wayIdList, formattedStartDate);


                toast.success("Status updated successfully!");
            } else {
                toast.error("Failed to update status. Please try again.");
            }

            setStatusDialog(false); // close dialog
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Status update failed!");
        }
    }


    // Reset Form
    const handleResetForm = (form) => {

        setEditId(null);
        const resetOutleOSFormData = formData.wayType === 0 ? resetOutletWayFormData : resetOSWayFormData;

        switch (form) {
            case "0":
                setFormData((prev) => ({
                    ...prev,
                    ...resetOutleOSFormData
                }));
                break;
            case "00":
                setFormData(initialWayFormData);
                break;
            case "1":
                setOutletFormData(initialOutletFormData);
                break;
            case "2":
                setCustomerFormData(initialCustomerFormData);
                break;
            default:
                break;
        }
    }

    // Calculate Total
    const handleCalculateTotal = (id) => {
        const item = filteredList.find((d) => d.wayId === id);
        if (!item) return;

        setMainFormData({
            outletId: item.outletId, customerId: item.customerId, itemPrice: item.itemPrice, deliFee: item.deliFee, status: item.status, itemQty: item.itemQty, wayType: item.wayType, marketName: item.marketName, pickupDeliCar: item.pickupDeliCar, senderDeliCar: item.senderDeliCar, city: item.city, townShipId: item.townShipId, wayDate: item.wayDate, remark: item.remark, complaint: item.complaint,
        });
        setCalculateDialog(true);
    };

    const finalFilteredList = filteredList
        .filter((item) => {
            //Destructure variables for easier access
            const { wayType, marketName, outletId, pickupDeliCar, status } = item;

            //Dashboard Filter (From Navigation State)
            if (location.state !== null && navStatus !== 0) {
                if (status !== navStatus) return false;
            }

            //Market filter (Specific Logic)
            if (isOrderTypeNew && !orderTypeDialog && formData.marketName !== "" && formData.wayType === 0) {
                if (!(wayType === 0 && marketName === formData.marketName)) return false;
            }

            //Outlet filter (Specific Logic)
            if (isOrderTypeNew && !orderTypeDialog && formData.outletId !== 0 && formData.wayType === 1) {
                if (!(wayType === 1 && outletId === formData.outletId && pickupDeliCar === formData.pickupDeliCar)) return false;
            }

            return true;
        }).sort((a, b) => {

            const priority = {
                2: 1,
                3: 2,
            };

            const priorityA = priority[a.status] || 99;
            const priorityB = priority[b.status] || 99;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return b.id - a.id;
        });

    // --- Pagination Logic ---
    const rowsPerPage = 10;
    const totalPages = Math.ceil(finalFilteredList.length / rowsPerPage);

    // လက်ရှိ Page အတွက် data ကို slice လုပ်ယူခြင်း
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = finalFilteredList.slice(indexOfFirst, indexOfLast);

    return (
        <>

            <div ref={topRef}></div>

            <div
                className={`flex gap-6 mt-10 mb-5 ${tableHeaders.length === 10 ? "flex-col" : "flex-col lg:flex-row"
                    }`}
            >
                <div className="flex-1 mb-1 flex flex-col gap-6">
                    <Card>
                        <CardHeader
                            variant="gradient"
                            color="gray"
                            className="mb-8 p-6 relative z-10 overflow-visible"
                        >

                            <div className="flex items-center justify-between flex-col lg:flex-row lg:items-center gap-4">

                                <div className="flex items-center justify-between w-full flex-wrap gap-4">
                                    {/* Headers Buttom */}
                                    {tableHeaders.length === 10 && (
                                        <>
                                            {/* Container ကို flex-col ပြောင်းလိုက်တာက ခလုတ်တွေနဲ့ စာသားတွေကို အပေါ်အောက် ဖြစ်သွားစေပါတယ် */}
                                            <div className="flex flex-col gap-4">

                                                {/* အပေါ်ပိုင်း: ခလုတ်များစုစည်းမှု */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {/* B1, B2, B3 ကို စုထားတဲ့ အုပ်စု */}
                                                    <div className="flex items-center gap-3">
                                                        <IconButton
                                                            variant="text"
                                                            color="blue-gray"
                                                            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                                                        >
                                                            <Bars3Icon strokeWidth={3} className="h-7 w-7 text-white" />
                                                        </IconButton>

                                                        <IconButton color="blue" className="px-5" onClick={() => setFilterDialog(true)}>
                                                            <i className="fas fa-filter" />
                                                        </IconButton>

                                                        <IconButton color="red" className="px-5" onClick={handleCancelFilter}>
                                                            <i className="fas fa-ban" />
                                                        </IconButton>

                                                        <IconButton
                                                            color="pink"
                                                            className="px-5"
                                                            onClick={() => {
                                                                fetchFunc(fetchWay, setFilteredList, "Way");
                                                                fetchFunc(fetchWay, setWayList, "Way");
                                                            }}
                                                        >
                                                            <i className="fas fa-refresh text-white" />
                                                        </IconButton>
                                                    </div>

                                                    {/* Make All Delivered Button - Screen သေးရင် တစ်ကြောင်းလုံးယူမယ်၊ ကြီးရင် ပုံမှန်အတိုင်းနေမယ် */}
                                                    <div className="w-full md:w-auto">
                                                        <Button
                                                            variant="contained"
                                                            fullWidth // Screen သေးရင် အပြည့်ဖြစ်အောင်
                                                            style={{ backgroundColor: "green", color: "white" }}
                                                            className="whitespace-nowrap"
                                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#16a34a"}
                                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "green"}
                                                            onClick={() => setDeliveryDialog(true)}
                                                        >
                                                            Make All Deliveried
                                                        </Button>
                                                    </div>

                                                    {/* B4, B5 (Excel & Add) အုပ်စု */}
                                                    <div className="flex items-center gap-3">
                                                        <IconButton className="px-5 bg-[#0B192C] hover:bg-[#152C4B] transition-all duration-200" onClick={() => handleExportExcel(filteredList, exportColumns, "1")}>
                                                            <img src={delivery} width={70} alt="Excel" className="min-w-[25px]" />
                                                        </IconButton>

                                                        <IconButton className="px-5 bg-[#0B192C] hover:bg-[#152C4B] transition-all duration-200" onClick={() => handleExportExcel(filteredList, exportColumns, "2")}>
                                                            <img src={office} width={70} alt="Excel" className="min-w-[25px]" />
                                                        </IconButton>

                                                        {canAdd && (
                                                            <IconButton color="green" className="px-5" onClick={() => setOrderTypeDialog(!orderTypeDialog)}>
                                                                <i className="fas fa-add" />
                                                            </IconButton>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* အောက်ပိုင်း: Filter Tags (ခလုတ်တွေရဲ့အောက်ကို ရောက်သွားပါပြီ) */}
                                                <div className="p-2 border-t border-gray-100">
                                                    {Object.keys(activeFilters).length > 0 ? (
                                                        <div className="text-sm font-medium">
                                                            <div className="flex items-center gap-2 mb-5">
                                                                <p className="text-gray-600 font-bold text-base">Filtered total way : </p>

                                                                <span className="bg-blue-100 text-blue-800 text-base font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                                    {filteredList.length} Qty
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-8 gap-2">
                                                                {Object.entries(activeFilters).map(([key, value]) => {

                                                                    let displayValue = value;

                                                                    if (key === "wayType") {
                                                                        const found = wayTypeList.find(item => item.value === Number(value));
                                                                        displayValue = found ? found.label : value;
                                                                    }

                                                                    else if (key === "status") {
                                                                        const found = statusList.find(item => item.value === Number(value));
                                                                        displayValue = found ? found.label : value;
                                                                    }
                                                                    else if (key === "regionId" || key === "city") {
                                                                        const found = mmRegions.find(item => item.regionId === Number(value));
                                                                        displayValue = found ? found.regionName : value;
                                                                    }

                                                                    else if (key === "townShip") {
                                                                        const found = townShipList.find(item => item.townShipId === Number(value));
                                                                        displayValue = found ? found.townShipName : value;
                                                                    }

                                                                    else if (key === "senderDeliCar") {
                                                                        const found = deliAreaList.find(item => item.deliAreaId === Number(value));
                                                                        displayValue = found ? found.deliCarNo : value;
                                                                    }

                                                                    else if (key === "market") {
                                                                        const found = marketList.find(item => item.marketId === Number(value));
                                                                        displayValue = found ? found.marketName : value;
                                                                    }

                                                                    else if (key === "startDate") {

                                                                        const dateObj = new Date(value);

                                                                        const year = dateObj.getFullYear();
                                                                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(dateObj.getDate()).padStart(2, '0');
                                                                        const datePart = `${year}-${month}-${day}`;

                                                                        const timePart = dateObj.toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        });

                                                                        displayValue = `${datePart}, ${timePart}`;
                                                                    }

                                                                    else if (key === "endDate") {

                                                                        const dateObj = new Date(value);

                                                                        const year = dateObj.getFullYear();
                                                                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(dateObj.getDate()).padStart(2, '0');
                                                                        const datePart = `${year}-${month}-${day}`;

                                                                        const timePart = dateObj.toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        });

                                                                        displayValue = `${datePart}, ${timePart}`;
                                                                    }

                                                                    else if (key === "startOfficeDate") {

                                                                        const dateObj = new Date(value);

                                                                        const year = dateObj.getFullYear();
                                                                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(dateObj.getDate()).padStart(2, '0');
                                                                        const datePart = `${year}-${month}-${day}`;

                                                                        const timePart = dateObj.toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        });

                                                                        displayValue = `${datePart}, ${timePart}`;
                                                                    }

                                                                    else if (key === "endOfficeDate") {

                                                                        const dateObj = new Date(value);

                                                                        const year = dateObj.getFullYear();
                                                                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(dateObj.getDate()).padStart(2, '0');
                                                                        const datePart = `${year}-${month}-${day}`;

                                                                        const timePart = dateObj.toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        });

                                                                        displayValue = `${datePart}, ${timePart}`;
                                                                    }

                                                                    return (
                                                                        <div
                                                                            key={key}
                                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded truncate text-center shadow-sm min-w-max"
                                                                            title={`${key} : ${displayValue}`}
                                                                        >
                                                                            <span className="font-bold text-[10px] uppercase block text-blue-500">
                                                                                {key}
                                                                            </span>
                                                                            <span className="block truncate text-[12px] font-semibold">
                                                                                {displayValue}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (

                                                        <p className="mb-2 text-gray-600 font-bold">No filters applied</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right group: Add & Export */}
                                            {/* <div className="flex items-center gap-4">
                                                <IconButton color="blue-gray" className="px-5" onClick={() => {
                                                    handleExportExcel(filteredList, exportColumns)
                                                }}>
                                                    <img src={excel} width={70} alt="Way" />
                                                </IconButton>
                                                <IconButton
                                                    color="blue-gray"
                                                    className="px-5"
                                                    onClick={() => handleExportPdf({ filteredList, exportColumns })}
                                                    title="Download PDF"
                                                >
                                                    <img src={pdf} width={70} alt="Download PDF" />
                                                </IconButton>

                                                {canAdd && (
                                                    <IconButton color="green" className="px-5" onClick={() => {
                                                        setOrderTypeDialog(!orderTypeDialog);
                                                    }}>
                                                        <i className="fas fa-add" />
                                                    </IconButton>
                                                )}
                                            </div> */}
                                        </>
                                    )}

                                    {tableHeaders.length !== 10 && (
                                        <>
                                            {/* Left group: Filter & Cancel */}
                                            <div className="flex flex-col items-center gap-4">
                                                <Typography className="text-xl font-semibold text-center">
                                                    {formData.wayType === 0
                                                        ? formData.marketName
                                                        : `${outletList.find((outlet) => outlet.outletId === formData.outletId)?.outletName}, Pickup Car : ${deliAreaList.find((deliArea) => deliArea.deliAreaId === formData.pickupDeliCar)?.deliCarNo}`
                                                    }
                                                </Typography>
                                            </div>


                                            {/* Right group: Add & Export */}
                                            <div className="flex items-center gap-4">
                                                <Button color="blue-gray" onClick={() => {
                                                    setTableHeaders(mainHeaders);
                                                    setMainWayTable(true);
                                                    handleResetForm("00");
                                                    setIsOrderTypeNew(false);
                                                    fetchFunc(fetchWay, setFilteredList, "Way");
                                                    fetchFunc(fetchWay, setWayList, "Way");
                                                }}>Back Main Table</Button>
                                            </div>
                                        </>
                                    )}


                                </div>
                            </div>
                        </CardHeader>

                        {/* Top Pagination */}
                        <div className="flex justify-center items-center gap-2 mr-5 flex-wrap">
                            {/* Previous Button */}
                            <Button
                                size="sm"
                                variant="text"
                                color="gray"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                <ChevronLeftIcon className="h-5 w-5" /> {/* အိုင်ကွန် သုံးချင်ရင် */}
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">

                                {getPageNumbers(currentPage, totalPages).map((page, index) => {
                                    if (page === "...") {
                                        return <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={page === currentPage ? "filled" : "text"}
                                            color={page === currentPage ? "blue" : "gray"}
                                            // className={page === currentPage ? "rounded-lg" : "rounded-lg border border-gray-200"}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[40px] h-10 font-bold ${page === currentPage ? "rounded-lg" : "rounded-lg border border-gray-200"
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <Button
                                size="sm"
                                variant="text"
                                color="gray"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </Button>
                        </div>


                        <CardBody className="overflow-auto px-0 pt-0 pb-2" style={{ maxHeight: "500px" }}>
                            <table className="w-full mt-8 min-w-[640px] table-auto">
                                <thead className="sticky top-0 bg-white z-20 ">
                                    <tr>
                                        <th className="border-b border-blue-gray-50 py-3 px-5 text-center bg-white top-0">

                                        </th>
                                        {tableHeaders.map((header) => (
                                            <th
                                                className={`border-b border-blue-gray-50 py-3 px-5 text-center bg-white top-0`}
                                                key={header}
                                            >
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                >
                                                    {header}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="overflow-y-auto">
                                    {currentRows.map((item, key) => (
                                        <tr
                                            key={item.wayId}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td
                                                className={`py - 2 px - 0 text - center ${key === currentRows.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                    } `}
                                            >
                                                {/* {item.status === 5 && (
                                                    <Tooltip
                                                        content={
                                                            <div className="text-white text-xs rounded-md px-2 py-1 space-y-2">
                                                                <p>{item.wayDate}</p>
                                                            </div>
                                                        }
                                                    >
                                                        <div>
                                                            <img
                                                                src={doneSign}
                                                                width={22}
                                                                alt="Way"
                                                                className="ml-7"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                )}

                                                {item.status === 3 && (
                                                    <Tooltip
                                                        content={
                                                            <div className="text-white text-xs rounded-md px-2 py-1 space-y-2">
                                                                <p>{item.complaint}</p>
                                                            </div>
                                                        }
                                                    >
                                                        <div>
                                                            <img
                                                                src={remainWay}
                                                                width={30}
                                                                alt="Way"
                                                                className="ml-6"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                )} */}
                                            </td>

                                            {tableHeaders.map((header) =>
                                                renderCell(
                                                    (currentPage - 1) * rowsPerPage + key,
                                                    header,
                                                    item,
                                                    `py - 2 px - 0 ${key === currentRows.length - 1
                                                        ? ""
                                                        : "border-b border-blue-gray-50"
                                                    } `,
                                                    tableHeaders,
                                                    townShipList,
                                                    isMainWayTable,
                                                    setStatusDialog,
                                                    handleWayEdit,
                                                    openDeleteConfirmDialog,
                                                    StatusDialogOpen,
                                                    handleCalculateTotal,
                                                    canEdit,
                                                    canDelete,
                                                    handleOpenHistory
                                                )
                                            )}
                                        </tr>
                                    ))}
                                </tbody>

                            </table>


                        </CardBody>

                        {/* Bottom Pagination */}
                        <div className="flex justify-center items-center gap-2 mr-5  px-4 py-4 flex-wrap">
                            {/* Previous Button */}
                            <Button
                                size="sm"
                                variant="text"
                                color="gray"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                <ChevronLeftIcon className="h-5 w-5" /> {/* အိုင်ကွန် သုံးချင်ရင် */}
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">

                                {getPageNumbers(currentPage, totalPages).map((page, index) => {
                                    if (page === "...") {
                                        return <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={page === currentPage ? "filled" : "text"}
                                            color={page === currentPage ? "blue" : "gray"}
                                            // className={page === currentPage ? "rounded-lg" : "rounded-lg border border-gray-200"}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[40px] h-10 font-bold ${page === currentPage ? "rounded-lg" : "rounded-lg border border-gray-200"
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <Button
                                size="sm"
                                variant="text"
                                color="gray"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </Card>
                </div >


                {/* Input Form */}
                {tableHeaders.length !== 10 && (
                    <div className="w-full lg:w-1/3 mr-2">
                        <div className="flex flex-col gap-5 bg-white p-4 rounded shadow-md w-full max-w-full">
                            <div className="flex items-center justify-between pb-3 border-b-2">
                                {/* Title */}
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {editId !== null ? "Edit Way" : "Add New Way"}
                                </h2>

                                {/* Buttons */}
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        size="sm"
                                        color="red"
                                        variant="text"
                                        onClick={() => { handleResetForm("0"), setEditId(null) }}
                                        title="Reset Form"
                                    >
                                        <i className="fas fa-eraser text-lg" />
                                    </IconButton>

                                    {/* <Button
                                        color="green"
                                        onClick={handleWaySave}
                                        className="px-4 py-2 font-medium"
                                    >
                                        {editId !== null ? "Edit" : "Add"}
                                    </Button> */}
                                </div>
                            </div>


                            {/* customer input */}
                            <div>
                                <div className="flex gap-1.5">
                                    <CreatableSelect
                                        options={customerList.map((item) => ({
                                            value: item.customerId,
                                            label: `${item.customerName} - ${item.customerPhone} `,
                                        }))}
                                        value={
                                            customerList
                                                .map((item) => ({
                                                    value: item.customerId,
                                                    label: `${item.customerName} - ${item.customerPhone} `,
                                                }))
                                                .find((option) => option.value === formData.customerId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            handleInputChange({
                                                customerId: selectedOption ? selectedOption.value : null,
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Tab") {
                                                e.preventDefault();
                                                formData.wayType === 0 ? outletInputRef.current.focus() : itemPriceInputRef.current.focus();
                                            }
                                            // if (e.key === "Enter" && editId !== null) {
                                            //     e.preventDefault();
                                            //     customerInputRef.current.focus();
                                            //     handleWaySave();
                                            // }
                                        }}
                                        onCreateOption={(inputValue) => {
                                            setCustomerFormData((prev) => ({
                                                ...prev,
                                                customerName: inputValue,
                                            }));
                                            setCustomerDialog(true);

                                            setTimeout(() => {
                                                if (customerPhoneRef && customerPhoneRef.current) {
                                                    customerPhoneRef.current.focus();
                                                }
                                            }, 150);
                                        }}
                                        ref={formData.wayType === 0 ? customerInputRef : itemPriceInputRef}
                                        isClearable
                                        placeholder="Customer Name"
                                        className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                        classNamePrefix="react-select"
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                overflow: "hidden",
                                                padding: 10,
                                            }),
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                minHeight: "2.5rem",
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                color: "#546E7A",
                                                backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                            }),
                                        }}
                                    />
                                    {/* <IconButton color="green" onClick={() => {
                                    setCustomerDialog(true);
                                }}>
                                    <i className="fas fa-add" />
                                </IconButton> */}
                                </div>

                                {wayErrors.customerId && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.customerId}</p>
                                )}
                            </div>

                            {/* outlet input */}
                            <div>
                                <div className="flex gap-1.5">
                                    <div className="relative w-full">
                                        <CreatableSelect
                                            options={outletList
                                                .filter((item) => item.outletType === formData.wayType && item.marketId === formData.marketId)
                                                .map((item) => ({
                                                    value: item.outletId,
                                                    label: `${item.outletName} - ${item.outletPhone} `,
                                                }))}
                                            value={
                                                outletList
                                                    .filter((item) => item.outletType === formData.wayType)
                                                    .map((item) => ({
                                                        value: item.outletId,
                                                        label: `${item.outletName} - ${item.outletPhone} `,
                                                    }))
                                                    .find((option) => option.value === formData.outletId) || null
                                            }
                                            onChange={(selectedOption) => {
                                                handleInputChange({
                                                    outletId: selectedOption ? selectedOption.value : null,
                                                });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    e.preventDefault();
                                                    itemPriceInputRef.current.focus();
                                                }
                                                // if (e.key === "Enter" && editId !== null) {
                                                //     e.preventDefault();
                                                //     outletInputRef.current.focus();
                                                //     handleWaySave();
                                                // }
                                            }}
                                            onCreateOption={(inputValue) => {
                                                setOutletFormData((prev) => ({
                                                    ...prev,
                                                    outletName: inputValue,
                                                    outletType: 0,
                                                }));
                                                setOutletDialog(true);

                                                setTimeout(() => {
                                                    if (outletPhoneRef && outletPhoneRef.current) {
                                                        outletPhoneRef.current.focus();
                                                    }
                                                }, 150);
                                            }}
                                            ref={outletInputRef}
                                            isClearable
                                            isDisabled={(formData.wayType !== 1) ? false : true}
                                            placeholder="Outlet Name"
                                            className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                            classNamePrefix="react-select"
                                            styles={{
                                                menu: (provided) => ({
                                                    ...provided,
                                                    borderRadius: 7,
                                                    overflow: "hidden",
                                                    padding: 10,
                                                }),
                                                control: (provided) => ({
                                                    ...provided,
                                                    borderRadius: 7,
                                                    minHeight: "2.5rem",
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    color: "#546E7A",
                                                    backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                                }),
                                            }}
                                        />
                                    </div>

                                    {/* <IconButton color="green" onClick={() => {
                                    setOutletDialog(true);
                                }}>
                                    <i className="fas fa-add" />
                                </IconButton> */}
                                </div>
                                {wayErrors.outletId && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.outletId}</p>
                                )}
                            </div>

                            {/* ItemPrice input */}
                            {/* {editId && */}
                            {<div>
                                <Input
                                    label="Item Price"
                                    name="itemPrice"
                                    value={formData.itemPrice}
                                    inputRef={itemPriceInputRef}
                                    onChange={(e) => {
                                        const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                        handleInputChange({ itemPrice: intValue });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            deliFeeInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter") {
                                        //     e.preventDefault();
                                        //     itemPriceInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                />
                                {wayErrors.itemPrice && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.itemPrice}</p>
                                )}
                            </div>
                            }


                            {/* DeliFee input */}
                            <div>
                                <Input
                                    label="Deli Fee"
                                    name="deliFee"
                                    value={formData.deliFee}
                                    inputRef={deliFeeInputRef}
                                    onChange={(e) => {
                                        const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                        handleInputChange({ deliFee: intValue });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            cityInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter") {
                                        //     e.preventDefault();
                                        //     deliFeeInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                />
                                {wayErrors.deliFee && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.deliFee}</p>
                                )}
                            </div>

                            {/* TotalValue input */}
                            {/* {editId && */}
                            {
                                <Input
                                    label="Total Value"
                                    name="totalValue"
                                    value={(formData.itemPrice || 0) + (formData.deliFee || 0)}
                                    disabled
                                />
                            }

                            {/* Item Qty input */}
                            {/* {editId &&
                                <div>
                                    <Input
                                        label="Item Qty"
                                        name="itemQty"
                                        value={formData.itemQty}
                                        inputRef={itemQtyInputRef}
                                        onChange={(e) => {
                                            const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                            handleInputChange({ itemQty: intValue });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Tab") {
                                                e.preventDefault();
                                                cityInputRef.current.focus();
                                            }
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                customerInputRef.current.focus();
                                                handleWaySave();
                                            }
                                        }}
                                    />
                                    {wayErrors.itemQty && (
                                        <p className="text-red-500 text-xs ml-1">{wayErrors.itemQty}</p>
                                    )}
                                </div>
                            } */}


                            {/* city input */}
                            <div>
                                <ReactSelect
                                    options={mmRegions
                                        .filter((item) => item.regionId !== 0)
                                        .map((item) => ({
                                            value: item.regionId,
                                            label: `${item.regionName} `,
                                        }))}
                                    value={
                                        mmRegions
                                            .filter((item) => item.regionId !== 0)
                                            .map((item) => ({
                                                value: item.regionId,
                                                label: `${item.regionName} `,
                                            }))
                                            .find((option) => option.value === formData.city) || null
                                    }
                                    onChange={(selectedOption) => {
                                        handleInputChange({
                                            city: selectedOption ? selectedOption.value : null,
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            townShipInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter") {
                                        //     e.preventDefault();
                                        //     customerInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                    ref={cityInputRef}
                                    isClearable
                                    placeholder="City"
                                    className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                    classNamePrefix="react-select"
                                    menuPlacement="top" o
                                    styles={{
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            overflow: "hidden",
                                            padding: 10,
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            minHeight: "2.5rem",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            color: "#546E7A",
                                            backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                        }),
                                    }}
                                />
                                {wayErrors.city && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.city}</p>
                                )}
                            </div>

                            {/* TownShip input */}

                            <div className="relative w-full">
                                <ReactSelect
                                    ref={townShipInputRef}
                                    options={
                                        townShipList.flatMap(ts =>
                                            deliAreaList
                                                .filter(car => car.townShipNames.includes(ts.townShipName))
                                                .map(car => ({
                                                    value: {
                                                        townShipId: ts.townShipId,
                                                        senderDeliCar: car.deliAreaId
                                                    },
                                                    label: `${car.deliCarNo} - ${ts.townShipName}`,
                                                    townShipName: ts.townShipName
                                                }))
                                        )
                                            // 🎯 နာမည်တူရာ (လှိုင်၊ ကမာရွတ် စသဖြင့်) ဒေသအလိုက် ဆက်တိုက်ဖြစ်အောင် စီပေးမယ့် Logic
                                            .sort((a, b) => {
                                                if (a.townShipName === 'All') return -1; // 'All' ပါရင် ထိပ်ဆုံးမှာ ထားမယ်
                                                if (b.townShipName === 'All') return 1;

                                                // မြန်မာစာလုံးအက္ခရာအလိုက် "လှိုင်" တွေအကုန် တစ်စုတည်းဖြစ်အောင် စီလိုက်တာပါ
                                                return a.townShipName.localeCompare(b.townShipName, 'my');
                                            })
                                    }
                                    value={
                                        townShipList.flatMap(ts =>
                                            deliAreaList
                                                .filter(car => car.townShipNames.includes(ts.townShipName))
                                                .map(car => ({
                                                    value: {
                                                        townShipId: ts.townShipId,
                                                        senderDeliCar: car.deliAreaId
                                                    },
                                                    label: `${car.deliCarNo} - ${ts.townShipName} `
                                                }))
                                        ).find(option => option.value.townShipId === formData.townShipId &&
                                            option.value.senderDeliCar === formData.senderDeliCar
                                        ) || null
                                    }
                                    onChange={(selectedOption) => {
                                        handleInputChange({
                                            townShipId: selectedOption ? selectedOption.value.townShipId : null,
                                            senderDeliCar: selectedOption ? selectedOption.value.senderDeliCar : null,
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            // wayDateInputRef.current.focus();
                                            remarkInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter") {
                                        //     e.preventDefault();
                                        //     customerInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                    isClearable
                                    placeholder="TownShip"
                                    className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                    classNamePrefix="react-select"
                                    menuPlacement="top"
                                    styles={{
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            overflow: "hidden",
                                            padding: 10,
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            minHeight: "2.5rem",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            color: "#546E7A",
                                            backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                        }),
                                    }}
                                />

                                {/* Show matching cars dynamically below the input */}
                                {matchingCars.length > 0 && (
                                    <div className="absolute mt-1 bg-white w-full border rounded shadow z-10 max-h-40 overflow-auto">
                                        {matchingCars.map((car, index) => (
                                            <div key={index} className="p-2 border-b last:border-b-0">
                                                <div><strong>Car No:</strong> {car.deliCarNo}</div>
                                                <div><strong>Townships:</strong> {car.townships.join(", ")}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {wayErrors.townShipId && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.townShipId}</p>
                                )}
                            </div>

                            {/* wayDate input */}
                            {/* <div>
                                <Input
                                    type="date"
                                    label="Select a Date"
                                    name="wayDate"
                                    value={formData.wayDate}
                                    onChange={handleInputChange}
                                    inputRef={wayDateInputRef}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            remarkInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter") {
                                        //     e.preventDefault();
                                        //     customerInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                />
                                {wayErrors.wayDate && (
                                    <p className="text-red-500 text-xs ml-1">{wayErrors.wayDate}</p>
                                )}
                            </div> */}


                            {/* remark input */}
                            <Input label="Remark" value={formData.remark} name="remark" inputRef={remarkInputRef} onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        customerInputRef.current.focus();
                                    }
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        customerInputRef.current.focus();
                                        handleWaySave();
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div >

            {/* Dialog Lists 
            ------------------
            1. Status Dialog             
            2. Order Type Dialog 
            3. Outlet Dialog 
            4. Customer Dialog 
            5. Delete Confirm Dialog
            6. Calculate Dialog 
            7. Filter Dialog
            8. Edit Dialog
            */}

            {/* Status Dialog */}
            <StatusDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                onSubmit={handleStatusSubmit}
                status={editStatusId.statusId}
                wayId={editStatusId.wayId}
                complaint={editStatusId.complaint}
                wayDateItem={editStatusId.wayDateItem}
            />

            {/* Order Type Dialog */}
            <Dialog
                open={orderTypeDialog}
                handler={handleOrderTypeDialogClose}
                size="xs"
                className="!max-w-[90%] sm:!max-w-sm"
            >
                <DialogHeader className="text-lg">Choose Order Type</DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    {/* Order type selection */}
                    <div className="flex gap-14 justify-center">
                        <Radio
                            name="wayType"
                            value="0"
                            label={
                                <Typography className="text-sm font-semibold text-blue-gray-600 text-center">
                                    Outlet Order
                                </Typography>
                            }
                            checked={formData.wayType === 0}
                            onChange={(e) => {
                                handleOrderTypechange({ marketName: "", outletId: 0, wayType: parseInt(e.target.value, 10) })
                            }}
                        />
                        <Radio
                            name="wayType"
                            value="1"
                            label={
                                <Typography className="text-sm font-semibold text-blue-gray-600 text-center">
                                    Online Order
                                </Typography>
                            }
                            checked={formData.wayType === 1}
                            onChange={(e) => {
                                handleOrderTypechange({ marketName: "", outletId: 0, wayType: parseInt(e.target.value, 10) })
                            }}
                        />
                    </div>

                    {/* Conditional render */}
                    {formData.wayType === 0 ? (
                        <>
                            <Select
                                label="Market Name"
                                onChange={(value) => {
                                    const selectedMarket = marketList.find((m) => {
                                        return m.marketName.toString() === value;
                                    });
                                    handleOrderTypechange({
                                        marketId: selectedMarket.marketId,
                                        marketName: selectedMarket.marketName
                                    });
                                }}
                            >
                                {marketList
                                    .filter(item => item.marketId !== 0 && item.marketName !== "All")
                                    .map((item) => (
                                        <Option key={item.marketId} value={item.marketName}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600 pb-1">
                                                {item.marketName}
                                            </Typography>
                                        </Option>
                                    ))
                                }
                            </Select>

                            {orderTypeErrors.marketName && (
                                <p className="text-red-500 text-xs ml-1">{orderTypeErrors.marketName}</p>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-1.5">
                                <div className="relative w-full">
                                    <CreatableSelect
                                        options={
                                            outletList
                                                .filter((item) => item.outletType === 1)
                                                .map((item) => ({
                                                    value: item.outletId,
                                                    label: `${item.outletName} - ${item.outletPhone} `,
                                                }))}
                                        value={
                                            outletList
                                                .filter((item) => item.outletType === 1)
                                                .map((item) => ({
                                                    value: item.outletId,
                                                    label: `${item.outletName} - ${item.outletPhone} `,
                                                }))
                                                .find((option) => option.value === formData.outletId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            handleOrderTypechange({
                                                outletId: selectedOption ? selectedOption.value : null,
                                            });
                                        }}
                                        onCreateOption={(inputValue) => {
                                            setOutletFormData((prev) => ({
                                                ...prev,
                                                outletName: inputValue,
                                                outletType: 1,
                                            }));
                                            setOutletDialog(true);
                                        }}
                                        isClearable
                                        placeholder="OS Name"
                                        className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                        classNamePrefix="react-select"
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                overflow: "hidden",
                                                padding: 10,
                                            }),
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                minHeight: "2.5rem",
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                color: "#546E7A",
                                                backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                            }),
                                        }}
                                    />
                                </div>
                            </div>

                            {orderTypeErrors.outletName && (
                                <p className="text-red-500 text-xs ml-1">{orderTypeErrors.outletName}</p>
                            )}

                            <Select
                                label="Pickup Car"
                                onChange={(value) => {
                                    handleOrderTypechange({ pickupDeliCar: value ? parseInt(value, 10) : "" });
                                }}
                            >
                                {deliAreaList
                                    ?.filter(item => item.deliAreaId !== 0).map((item) => (
                                        <Option key={item.deliAreaId} value={item.deliAreaId.toString()}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600 pb-1">
                                                {item.deliCarNo}
                                            </Typography>
                                        </Option>
                                    ))}
                            </Select>

                            {orderTypeErrors.pickupDeliCar && (
                                <p className="text-red-500 text-xs ml-1">{orderTypeErrors.pickupDeliCar}</p>
                            )}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
                    <div className="flex justify-end">
                        <div className="pr-3">
                            <Button
                                variant="gradient"
                                color="green"
                                onClick={handleOrderTypeSubmit}
                                className="w-full sm:w-auto"
                            >
                                Submit
                            </Button>
                        </div>
                        <Button
                            variant="gradient"
                            color="blue"
                            onClick={() => {
                                handleOrderTypeSubmit("0");
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogFooter>
            </Dialog>

            {/* Outlet Dialog */}
            <Dialog open={outletDialog} handler={() => handleOutletDialogClose()} size="xs" className="!max-w-[90%] sm:!max-w-md">
                <DialogHeader className="relative">
                    Add New Outlet
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    <div>
                        <Input label="Name" name="outletName"
                            value={outletFormData.outletName}
                            onChange={handleOutletInputChange}
                            inputRef={outletNameRef}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    outletPhoneRef.current.focus();
                                }
                            }} />
                        {outletErrors.outletName && (
                            <p className="text-red-500 text-xs ml-1">{outletErrors.outletName}</p>
                        )}
                    </div>
                    <div>
                        <Input label="Phone" name="outletPhone"
                            value={outletFormData.outletPhone}
                            onChange={handleOutletInputChange}
                            inputRef={outletPhoneRef}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    outletAddressRef.current.focus();
                                }
                            }}
                        />
                        {outletErrors.outletPhone && (
                            <p className="text-red-500 text-xs ml-1">{outletErrors.outletPhone}</p>
                        )}
                    </div>
                    <div>
                        <Input label="Address" name="outletAddress"
                            value={outletFormData.outletAddress}
                            onChange={handleOutletInputChange}
                            inputRef={outletAddressRef}
                        // onKeyDown={(e) => {
                        //     if (e.key === "Tab") {
                        //         e.preventDefault();
                        //         outletTypeRef.current.focus();
                        //     }
                        // }}
                        />
                        {outletErrors.outletAddress && (
                            <p className="text-red-500 text-xs ml-1">{outletErrors.outletAddress}</p>
                        )}
                    </div>
                    <ReactSelect
                        options={wayTypeList.map((item) => ({
                            value: item.value,
                            label: `${item.label} `,
                        }))}
                        value={
                            wayTypeList
                                .map((item) => ({
                                    value: item.value,
                                    label: `${item.label} `,
                                }))
                                .find((option) => option.value === outletFormData.outletType) || null
                        }
                        onChange={(selectedOption) => {
                            handleOutletInputChange({
                                outletType: selectedOption ? selectedOption.value : null,
                            });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Tab") {
                                e.preventDefault();
                                outletNameRef.current.focus();
                            }
                        }}
                        ref={outletTypeRef}
                        isClearable
                        isDisabled={true}
                        placeholder="Way Type"
                        className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                        classNamePrefix="react-select"
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                borderRadius: 7,
                                overflow: "hidden",
                                padding: 10,
                            }),
                            control: (provided) => ({
                                ...provided,
                                borderRadius: 7,
                                minHeight: "2.5rem",
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                color: "#546E7A",
                                backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                            }),
                        }}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button color="green" className="mr-3" onClick={() => handleOutletDialogSave()}>Save</Button>
                    <Button color="red" onClick={() => handleOutletDialogClose()}>Cancel</Button>
                </DialogFooter>
            </Dialog>

            {/* Customer Dialog */}
            <Dialog open={customerDialog} handler={() => handleCustomerDialogClose()} size="xs" className="!max-w-[90%] sm:!max-w-md">
                <DialogHeader className="relative">
                    Add New Customer
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    <div>
                        <Input label="Name" name="customerName"
                            value={customerFormData.customerName}
                            onChange={handleCustomerInputChange}
                            inputRef={customerNameRef}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    customerPhoneRef.current.focus();
                                }
                            }} />
                        {customerErrors.customerName && (
                            <p className="text-red-500 text-xs ml-1">{customerErrors.customerName}</p>
                        )}
                    </div>
                    <div>
                        <Input label="Phone" name="customerPhone"
                            value={customerFormData.customerPhone}
                            onChange={handleCustomerInputChange}
                            inputRef={customerPhoneRef}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    customerAddressRef.current.focus();
                                }
                            }}
                        />
                        {customerErrors.customerPhone && (
                            <p className="text-red-500 text-xs ml-1">{customerErrors.customerPhone}</p>
                        )}
                    </div>
                    <div>
                        <Input label="Address" name="customerAddress"
                            value={outletFormData.customerAddress}
                            onChange={handleCustomerInputChange}
                            inputRef={customerAddressRef}
                        // onKeyDown={(e) => {
                        //     if (e.key === "Tab") {
                        //         e.preventDefault();
                        //         customerNameRef.current.focus();
                        //     }
                        // }}
                        />
                        {customerErrors.customerAddress && (
                            <p className="text-red-500 text-xs ml-1">{customerErrors.customerAddress}</p>
                        )}
                    </div>
                    {errors && (
                        <p className="text-red-500 text-sm mb-2 font-medium">
                            {errors}
                        </p>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button color="green" className="mr-3" onClick={() => handleCustomerDialogSave()}>Save</Button>
                    <Button color="red" onClick={() => handleCustomerDialogClose()}>Cancel</Button>
                </DialogFooter>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={confirmDeleteDialog} handler={() => setConfirmDeleteDialog(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm">
                <DialogHeader className="text-red-500">Confirm Deletion</DialogHeader>
                <DialogBody className="text-lg font-semibold text-blue-gray-600">
                    Are you sure you want to delete this way record?
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" className="mr-2" color="gray" onClick={() => setConfirmDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="gradient" color="red" onClick={() => handleWayDelete()}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Calculate Dialog */}
            <Dialog open={calculateDialog} handler={() => setCalculateDialog(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm">
                <DialogHeader className="text-blue-500">Calculate way {mainFormData.wayId}</DialogHeader>
                <DialogBody className="text-lg font-semibold text-blue-gray-600">
                    <div>
                        <div className="mb-5 flex justify-between px-24">
                            <p className="text-sm" >ပစ္စည်းတန်ဖိုး : </p>
                            <p className="text-sm" >{mainFormData.itemPrice}</p>
                        </div>
                        <div className="mb-5 flex justify-between px-24">
                            <p className="text-sm" >Customer ဆီမှ Deli ခ : </p>
                            <p className="text-sm" >{mainFormData.deliFee}</p>
                        </div>
                        <div className="mb-5 flex justify-between px-24">
                            <p className="text-sm" >Outlet/OS ဆီမှ Deli ခ : </p>
                            <p className="text-sm" >{mainFormData.deliFee}</p>
                        </div>
                        <div className="mb-5 flex justify-between px-24">
                            <p className="text-sm" >ကြိုတင် ပေးချေငွေ : </p>
                            <p className="text-sm" >{mainFormData.deliFee}</p>
                        </div>
                        <div className="mb-5 flex justify-between px-24">
                            <p className="text-sm" >Outlet/OS ထံမှ လျော့စျေး : </p>
                            <p className="text-sm" >{mainFormData.deliFee}</p>
                        </div>

                        <div className="flex flex-col mt-14 justify-between">
                            <div className="flex items-center pb-3">
                                <p className="text-sm pr-3 mb-0.5">Customer ဆီမှကောက်ရမည့်ငွေ :</p>
                                <p>4000</p>
                            </div>


                            <div className="flex items-center">
                                <p className="text-sm pr-3 mb-0.5">Outlet/OS ကိုပေးရမည့်ငွေ :</p>
                                <p>4000</p>
                            </div>

                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" className="mr-2" color="gray" onClick={() => setCalculateDialog(false)}>
                        Back
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={filterDialog} handler={() => setFilterDialog(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar" dismiss={{ invisible: true, outsidePress: false }}
            >
                <DialogHeader className="flex justify-between items-center">
                    Filter

                    <button
                        onClick={() => setFilterDialog(false)}
                        className="text-black hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors duration-200"
                    >
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    {/* <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="min-w-0">
                            <Input label="Customer Name" name="customerName" value={filterFormData.customerName} onChange={handleFilterInputChange} containerProps={{ className: "!min-w-0" }} />
                        </div>
                        <div className="min-w-0">
                            <Input label="Outlet Name" name="outletName" value={filterFormData.outletName} onChange={handleFilterInputChange} containerProps={{ className: "!min-w-0" }} />
                        </div>
                    </div> */}
                    <div className="relative flex items-center w-full min-w-0 overflow-hidden border border-blue-gray-200 rounded-lg focus-within:border-gray-900 transition-all h-10">

                        <div className="flex items-center shrink-0 pl-3 pr-2 border-r border-blue-gray-200 h-full bg-gray-50/50 rounded-l-lg">
                            <Menu placement="bottom-start">
                                <MenuHandler>
                                    <div className="flex items-center gap-1 text-sm text-blue-gray-700 outline-none cursor-pointer py-1 font-sans font-medium select-none">
                                        <span>
                                            {filterBy === "0" ? "Name" : "Address"}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-blue-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </MenuHandler>

                                <MenuList className="min-w-[120px] p-1 border border-blue-gray-50 rounded-lg shadow-lg shadow-blue-gray-500/10 z-[9999]">
                                    <MenuItem
                                        className={`flex items - center text - sm py - 2 px - 3 rounded - md font - sans transition - all ${filterFormData.searchType === "customerName"
                                            ? "bg-blue-50 text-blue-600 font-semibold"
                                            : "text-blue-gray-700 hover:bg-blue-gray-50"
                                            } `}
                                        onClick={() => setFilterBy("0")}
                                    >
                                        Name
                                    </MenuItem>

                                    <MenuItem
                                        className={`flex items - center text - sm py - 2 px - 3 rounded - md font - sans transition - all ${filterFormData.searchType === "outletName"
                                            ? "bg-blue-50 text-blue-600 font-semibold"
                                            : "text-blue-gray-700 hover:bg-blue-gray-50"
                                            } `}
                                        onClick={() => setFilterBy("1")}
                                    >
                                        Address
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </div>

                        <div className="flex-1 min-w-0 h-full">
                            <input
                                type="text"
                                placeholder={filterBy === "0" ? "Search By Customer Name..." : "Search By Customer Address..."}
                                name="customer"
                                value={filterFormData.customer || ""}
                                onChange={handleFilterInputChange}
                                className="w-full h-full px-3 text-sm text-blue-gray-700 bg-transparent outline-none border-none placeholder:text-blue-gray-400 font-sans font-normal"
                            />
                        </div>

                    </div>
                    <div className="min-w-0">
                        <Input label="Outlet Name" name="outletName" value={filterFormData.outletName} onChange={handleFilterInputChange} containerProps={{ className: "!min-w-0" }} />
                    </div>
                    <Select
                        label="Select Status"
                        name="status"
                        value={
                            filterFormData.status !== undefined
                                ? filterFormData.status.toString()
                                : statusList[0].value.toString()
                        }
                        onChange={(val) =>
                            setFilterFormData((prev) => ({
                                ...prev,
                                status: Number(val),
                            }))
                        }
                    >
                        {statusList.map((status) => (
                            <Option key={status.value.toString()} value={status.value.toString()}>
                                {status.label}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        label="Select Sender DeliCar"
                        name="senderDeliCar"
                        value={
                            filterFormData.senderDeliCar !== undefined
                                ? filterFormData.senderDeliCar.toString()
                                : deliAreaList[0].deliAreaId.toString()
                        }
                        onChange={(val) =>
                            setFilterFormData((prev) => ({
                                ...prev,
                                senderDeliCar: Number(val),
                            }))
                        }
                    >
                        {deliAreaList.map((deliArea) => (
                            <Option key={deliArea.deliAreaId.toString()} value={deliArea.deliAreaId.toString()}>
                                {deliArea.deliCarNo}
                            </Option>
                        ))}
                    </Select>
                    {/* <div className="relative h-10 w-full min-w-[200px]">
                        <Input
                            type="date"
                            label="Select Way Date"
                            name="wayDate"
                            value={filterFormData.wayDate}
                            onChange={handleFilterInputChange}
                        />
                    </div> */}



                    <div className="flex flex-col gap-1 w-full">

                        <label className="text-base font-extrabold text-blue-gray-600 ml-1 pb-1 mb-3 border-b-2 border-cyan-700 w-max">
                            For Delivery
                        </label>


                        <div className="grid grid-cols-2 gap-4 w-full ">
                            {/* Start DateTime */}
                            <div className="w-full">
                                <Input
                                    type="datetime-local"
                                    label="Select Start Date"
                                    name="startDate"
                                    value={filterFormData.startDate}
                                    onChange={handleFilterInputChange}
                                    containerProps={{
                                        className: "!min-w-0",
                                    }}

                                />
                            </div>

                            {/* End DateTime */}
                            <div className="w-full">
                                <Input
                                    type="datetime-local"
                                    label="Select End Date"
                                    name="endDate"
                                    value={filterFormData.endDate}
                                    onChange={handleFilterInputChange}
                                    containerProps={{
                                        className: "!min-w-0",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full">

                        <label className="text-base font-extrabold text-blue-gray-600 ml-1 pb-1 mb-3 border-b-2 border-deep-orange-700 w-max">
                            For Office
                        </label>

                        <div className="grid grid-cols-2 gap-2 w-full">
                            {/* Start DateTime */}
                            <div className="w-full">
                                <Input
                                    type="datetime-local"
                                    label="Select Start Date"
                                    name="startOfficeDate"
                                    value={filterFormData.startOfficeDate}
                                    onChange={handleFilterInputChange}
                                    containerProps={{
                                        className: "!min-w-0",
                                    }}

                                />
                            </div>

                            {/* End DateTime */}
                            <div className="w-full">
                                <Input
                                    type="datetime-local"
                                    label="Select End Date"
                                    name="endOfficeDate"
                                    value={filterFormData.endOfficeDate}
                                    onChange={handleFilterInputChange}
                                    containerProps={{
                                        className: "!min-w-0",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Select
                        label="Select Sort By"
                        name="sortBy"
                        value={filterFormData.sortBy || ""}
                        onChange={(val) =>
                            setFilterFormData((prev) => ({
                                ...prev,
                                sortBy: val,
                            }))
                        }
                    >
                        {mainHeaders
                            .filter(header => header !== "No" && header !== "Action")
                            .map((header) => (
                                <Option key={header} value={header}>
                                    {header.charAt(0).toUpperCase() + header.slice(1)}
                                </Option>
                            ))}
                    </Select>
                    <Tabs value={String(filterFormData.wayType)}>
                        <TabsHeader>
                            {filterOrderTypeTabLists.map(({ label, value }) => (
                                <Tab
                                    key={value}
                                    value={String(value)}
                                    onClick={() =>
                                        setFilterFormData((prev) => ({
                                            ...prev,
                                            wayType: Number(value),
                                        }))
                                    }
                                >
                                    {label}
                                </Tab>
                            ))}
                        </TabsHeader>
                    </Tabs>

                    {/* <Select
                        label="Select Market"
                        name="market"
                        value={
                            filterFormData.market !== undefined
                                ? filterFormData.market.toString()
                                : marketList[0].marketId.toString()
                        }
                        onChange={(val) =>
                            setFilterFormData((prev) => ({
                                ...prev,
                                market: Number(val),
                            }))
                        }
                    >
                        {marketList.map((market) => (
                            <Option key={market.marketId.toString()} value={market.marketName.toString()}>
                                {market.marketName}
                            </Option>
                        ))}
                    </Select> */}

                    <Select
                        label="Select Market"
                        name="market"
                        value={
                            filterFormData.market !== undefined
                                ? filterFormData.market.toString()
                                : marketList[0].marketId.toString()
                        }
                        onChange={(val) =>
                            setFilterFormData((prev) => ({
                                ...prev,
                                market: Number(val),
                            }))
                        }
                    >
                        {marketList.map((market) => (
                            <Option key={market.marketId.toString()} value={market.marketId.toString()}>
                                {market.marketName}
                            </Option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="min-w-0">
                            <Select
                                label="Select City"
                                name="city"
                                value={
                                    filterFormData.city !== 0
                                        ? filterFormData.city.toString()
                                        : mmRegions[0].regionId.toString()
                                }
                                onChange={(val) =>
                                    setFilterFormData((prev) => ({
                                        ...prev,
                                        city: Number(val),
                                    }))
                                }
                                containerProps={{ className: "!min-w-0" }}
                            >
                                {mmRegions.map((region) => (
                                    <Option key={region.regionId.toString()} value={region.regionId.toString()}>
                                        {region.regionName}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="min-w-0">
                            <Select
                                label="Select TownShip"
                                name="townShip"
                                value={
                                    filterFormData.townShip !== undefined
                                        ? filterFormData.townShip.toString()
                                        : townShipList[0].townShipId.toString()
                                }
                                onChange={(val) =>
                                    setFilterFormData((prev) => ({
                                        ...prev,
                                        townShip: Number(val),
                                    }))
                                }
                                containerProps={{ className: "!min-w-0" }}
                            >
                                {townShipList.map((township) => (
                                    <Option key={township.townShipId.toString()} value={township.townShipId.toString()}>
                                        {township.townShipName}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <Input label="Package Fee" name="packageFee" value={filterFormData.packageFee} onChange={handleFilterInputChange} containerProps={{ className: "!min-w-0" }} />
                    </div>
                </DialogBody>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
                    <div className="flex justify-end gap-2 w-full sm:w-auto">
                        {/* <Button
                            variant="text"
                            color="gray"
                            onClick={handleCancelFilter}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button> */}
                        <Button
                            variant="gradient"
                            color="blue"
                            onClick={handleFilter}
                            className="w-full sm:w-auto"
                        >
                            Filter
                        </Button>
                    </div>
                </DialogFooter>
            </Dialog>

            <Dialog open={historyDialogOpen} handler={() => setHistoryDialogOpen(false)} size="lg">
                <DialogHeader className="text-blue-gray-900 font-bold">Way History</DialogHeader>
                <DialogBody className="overflow-y-auto max-h-[70vh] p-4">

                    {historyLoading ? (
                        <div className="flex justify-center items-center py-5">
                            <Typography className="text-sm font-medium text-gray-600">Loading Way...</Typography>
                        </div>
                    ) : historyList.length === 0 ? (
                        <Typography className="text-center py-5 text-gray-500">No history found</Typography>
                    ) : (
                        <div className="table-responsive bg-white rounded-lg border border-gray-200 shadow-sm">
                            <table className="w-full min-w-max table-auto text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 text-center">#</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Changed At</th>
                                        <th className="p-3">Complaint</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {historyList.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="p-3 text-center font-medium">{index + 1}</td>
                                            <td className="p-3">
                                                {/* 🎯 Status အရောင်ခွဲပြမည့် အပိုင်း */}
                                                {(() => {
                                                    switch (Number(item.status)) {
                                                        case 1: return <Chip variant="gradient" color="blue" value="PickUp" className="py-0.5 px-2 text-[11px] inline-block  text-white" />;
                                                        case 2: return <Chip variant="gradient" color="pink" value="Date Changed" className="py-0.5 px-2 text-[11px] inline-block  text-white" />;
                                                        case 3: return <Chip variant="gradient" color="amber" value="Pending" className="py-0.5 px-2 text-[11px] inline-block text-white" />;
                                                        case 4: return <Chip variant="gradient" color="red" value="Return" className="py-0.5 px-2 text-[11px] inline-block  text-white" />;
                                                        case 5: return <Chip variant="gradient" color="green" value="Delivered" className="py-0.5 px-2 text-[11px] inline-block  text-white" />;
                                                        default: return <Chip variant="gradient" color="blue-gray" value="Unknown" className="py-0.5 px-2 text-[11px] inline-block  text-white" />;
                                                    }
                                                })()}
                                            </td>
                                            <td className="p-3 text-gray-600 font-bold">{item.changed_at}</td>
                                            <td className="p-3">
                                                {item.complaint ? (
                                                    <Typography className="text-sm font-bold text-red-500">{item.complaint}</Typography>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setHistoryDialogOpen(false)} className="mr-1">
                        <span>ပိတ်မည်</span>
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Main Way Edit Dialog */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm">
                <DialogHeader className="text-red-500">
                    <h2 className=" border-b-2  pb-3   w-full max-w-full text-lg font-semibold text-gray-800">
                        Edit Way
                    </h2>

                </DialogHeader>
                <DialogBody className="text-lg font-semibold text-blue-gray-600">
                    <div className=" flex flex-col gap-5 p-1 rounded w-full max-w-full max-h-[65vh] overflow-y-auto">
                        {/* customer input */}
                        <div>
                            <div className="flex gap-1.5">
                                <CreatableSelect
                                    options={customerList.map((item) => ({
                                        value: item.customerId,
                                        label: `${item.customerName} - ${item.customerPhone} `,
                                    }))}
                                    value={
                                        customerList
                                            .map((item) => ({
                                                value: item.customerId,
                                                label: `${item.customerName} - ${item.customerPhone} `,
                                            }))
                                            .find((option) => option.value === mainFormData.customerId) || null
                                    }
                                    onChange={(selectedOption) => {
                                        handleInputChange({
                                            customerId: selectedOption ? selectedOption.value : null,
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            mainFormData.wayType === 0 ? outletInputRef.current.focus() : itemPriceInputRef.current.focus();
                                        }
                                        // if (e.key === "Enter" && editId !== null) {
                                        //     e.preventDefault();
                                        //     customerInputRef.current.focus();
                                        //     handleWaySave();
                                        // }
                                    }}
                                    onCreateOption={(inputValue) => {
                                        setEditDialog(false);
                                        setCustomerFormData((prev) => ({
                                            ...prev,
                                            customerName: inputValue,
                                        }));
                                        setCustomerDialog(true);
                                    }}
                                    ref={customerInputRef}
                                    isClearable
                                    placeholder="Customer Name"
                                    className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                    classNamePrefix="react-select"
                                    styles={{
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            overflow: "hidden",
                                            padding: 10,
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: 7,
                                            minHeight: "2.5rem",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            color: "#546E7A",
                                            backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                        }),
                                    }}
                                />
                                {/* <IconButton color="green" onClick={() => {
                                    setCustomerDialog(true);
                                }}>
                                    <i className="fas fa-add" />
                                </IconButton> */}
                            </div>

                            {wayErrors.customerId && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.customerId}</p>
                            )}
                        </div>

                        {/* outlet input */}
                        <div>
                            <div className="flex gap-1.5">
                                <div className="relative w-full">
                                    <CreatableSelect
                                        options={outletList
                                            .filter((item) => item.outletType === mainFormData.wayType)
                                            .map((item) => ({
                                                value: item.outletId,
                                                label: `${item.outletName} - ${item.outletPhone} `,
                                            }))}
                                        value={
                                            outletList
                                                .filter((item) => item.outletType === mainFormData.wayType)
                                                .map((item) => ({
                                                    value: item.outletId,
                                                    label: `${item.outletName} - ${item.outletPhone} `,
                                                }))
                                                .find((option) => option.value === mainFormData.outletId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            handleInputChange({
                                                outletId: selectedOption ? selectedOption.value : null,
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Tab") {
                                                e.preventDefault();
                                                itemPriceInputRef.current.focus();
                                            }
                                            // if (e.key === "Enter" && editId !== null) {
                                            //     e.preventDefault();
                                            //     customerInputRef.current.focus();
                                            //     handleWaySave();
                                            // }
                                        }}
                                        onCreateOption={(inputValue) => {
                                            setEditDialog(false);
                                            setOutletFormData((prev) => ({
                                                ...prev,
                                                outletName: inputValue,
                                                outletType: 0,
                                            }));
                                            setOutletDialog(true);
                                        }}
                                        ref={outletInputRef}
                                        isClearable
                                        isDisabled={(mainFormData.wayType !== 1) ? false : true}
                                        placeholder="Outlet Name"
                                        className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                        classNamePrefix="react-select"
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                overflow: "hidden",
                                                padding: 10,
                                            }),
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: 7,
                                                minHeight: "2.5rem",
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                color: "#546E7A",
                                                backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                            }),
                                        }}
                                    />
                                </div>

                                {/* <IconButton color="green" onClick={() => {
                                    setOutletDialog(true);
                                }}>
                                    <i className="fas fa-add" />
                                </IconButton> */}
                            </div>
                            {wayErrors.outletId && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.outletId}</p>
                            )}
                        </div>

                        {/* ItemPrice input */}
                        <div>
                            <Input
                                label="Item Price"
                                name="itemPrice"
                                value={mainFormData.itemPrice}
                                inputRef={itemPriceInputRef}
                                onChange={(e) => {
                                    const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                    handleInputChange({ itemPrice: intValue });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        deliFeeInputRef.current.focus();
                                    }
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        customerInputRef.current.focus();
                                        handleWaySave();
                                    }
                                }}
                            />
                            {wayErrors.itemPrice && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.itemPrice}</p>
                            )}
                        </div>

                        {/* DeliFee input */}
                        <div>
                            <Input
                                label="Deli Fee"
                                name="deliFee"
                                value={mainFormData.deliFee}
                                inputRef={deliFeeInputRef}
                                onChange={(e) => {
                                    const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                    handleInputChange({ deliFee: intValue });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        itemQtyInputRef.current.focus();
                                    }
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        customerInputRef.current.focus();
                                        handleWaySave();
                                    }
                                }}
                            />
                            {wayErrors.deliFee && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.deliFee}</p>
                            )}
                        </div>

                        {/* TotalValue input */}
                        <Input
                            label="Total Value"
                            name="totalValue"
                            value={(mainFormData.itemPrice || 0) + (mainFormData.deliFee || 0)}
                            disabled
                        />

                        {/* Item Qty input */}
                        <div>
                            <Input
                                label="Item Qty"
                                name="itemQty"
                                value={mainFormData.itemQty}
                                inputRef={itemQtyInputRef}
                                onChange={(e) => {
                                    const intValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                    handleInputChange({ itemQty: intValue });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        cityInputRef.current.focus();
                                    }
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        customerInputRef.current.focus();
                                        handleWaySave();
                                    }
                                }}
                            />
                            {wayErrors.itemQty && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.itemQty}</p>
                            )}
                        </div>


                        {/* city input */}
                        <div>
                            <ReactSelect
                                options={mmRegions
                                    .filter((item) => item.regionId !== 0)
                                    .map((item) => ({
                                        value: item.regionId,
                                        label: `${item.regionName} `,
                                    }))}
                                value={
                                    mmRegions
                                        .filter((item) => item.regionId !== 0)
                                        .map((item) => ({
                                            value: item.regionId,
                                            label: `${item.regionName} `,
                                        }))
                                        .find((option) => option.value === mainFormData.city) || null
                                }
                                onChange={(selectedOption) => {
                                    handleInputChange({
                                        city: selectedOption ? selectedOption.value : null,
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        townShipInputRef.current.focus();
                                    }
                                    // if (e.key === "Enter") {
                                    //     e.preventDefault();
                                    //     customerInputRef.current.focus();
                                    //     handleWaySave();
                                    // }
                                }}
                                ref={cityInputRef}
                                isClearable
                                placeholder="City"
                                className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                classNamePrefix="react-select"
                                menuPlacement="top" o
                                styles={{
                                    menu: (provided) => ({
                                        ...provided,
                                        borderRadius: 7,
                                        overflow: "hidden",
                                        padding: 10,
                                    }),
                                    control: (provided) => ({
                                        ...provided,
                                        borderRadius: 7,
                                        minHeight: "2.5rem",
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        color: "#546E7A",
                                        backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                    }),
                                }}
                            />
                            {wayErrors.city && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.city}</p>
                            )}
                        </div>

                        {/* TownShip input */}

                        <div className="relative w-full">
                            <ReactSelect
                                ref={townShipInputRef}
                                options={townShipList.flatMap(ts =>
                                    deliAreaList
                                        .filter(car => car.townShipNames.includes(ts.townShipName))
                                        .map(car => ({
                                            value: {
                                                townShipId: ts.townShipId,
                                                senderDeliCar: car.deliAreaId
                                            },
                                            label: `${car.deliCarNo} - ${ts.townShipName} `
                                        }))
                                )}
                                value={
                                    townShipList.flatMap(ts =>
                                        deliAreaList
                                            .filter(car => car.townShipNames.includes(ts.townShipName))
                                            .map(car => ({
                                                value: {
                                                    townShipId: ts.townShipId,
                                                    senderDeliCar: car.deliAreaId
                                                },
                                                label: `${car.deliCarNo} - ${ts.townShipName} `
                                            }))
                                    ).find(option => option.value.townShipId === mainFormData.townShipId &&
                                        option.value.senderDeliCar === mainFormData.senderDeliCar
                                    ) || null
                                }
                                onChange={(selectedOption) => {
                                    handleInputChange({
                                        townShipId: selectedOption ? selectedOption.value.townShipId : null,
                                        senderDeliCar: selectedOption ? selectedOption.value.senderDeliCar : null,
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        wayDateInputRef.current.focus();
                                    }
                                    // if (e.key === "Enter") {
                                    //     e.preventDefault();
                                    //     customerInputRef.current.focus();
                                    //     handleWaySave();
                                    // }
                                }}
                                isClearable
                                placeholder="TownShip"
                                className="w-full text-sm font-semibold text-blue-gray-600 pb-1"
                                classNamePrefix="react-select"
                                menuPlacement="top"
                                styles={{
                                    menu: (provided) => ({
                                        ...provided,
                                        borderRadius: 7,
                                        overflow: "hidden",
                                        padding: 10,
                                    }),
                                    control: (provided) => ({
                                        ...provided,
                                        borderRadius: 7,
                                        minHeight: "2.5rem",
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        color: "#546E7A",
                                        backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                                    }),
                                }}
                            />

                            {/* Show matching cars dynamically below the input */}
                            {matchingCars.length > 0 && (
                                <div className="absolute mt-1 bg-white w-full border rounded shadow z-10 max-h-40 overflow-auto">
                                    {matchingCars.map((car, index) => (
                                        <div key={index} className="p-2 border-b last:border-b-0">
                                            <div><strong>Car No:</strong> {car.deliCarNo}</div>
                                            <div><strong>Townships:</strong> {car.townships.join(", ")}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {wayErrors.townShipId && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.townShipId}</p>
                            )}
                        </div>

                        {/* wayDate input */}
                        <div>
                            <Input
                                type="datetime-local"
                                label="Select a Date"
                                name="wayDate"
                                value={mainFormData.wayDate ? mainFormData.wayDate.replace(" ", "T").substring(0, 16) : ""}
                                onChange={(e) => {
                                    const rawValue = e.target.value; // ရလာတဲ့တန်ဖိုးက "2026-05-10T19:19"
                                    if (rawValue) {
                                        // T ကို ဖယ်ပြီး space ပြန်ထည့်၊ ပြီးတော့ စက္ကန့်ပိုင်း :00 ထည့်လိုက်ပါတယ်
                                        const formattedDate = rawValue.replace("T", " ") + ":00";

                                        // မင်းရဲ့ မူလ handleInputChange ဆီကို object ပုံစံအတိုင်း ပြန်ပို့ပေးတာပါ
                                        handleInputChange({
                                            target: {
                                                name: "wayDate",
                                                value: formattedDate // ရလဒ်: "2026-05-10 19:19:00"
                                            }
                                        });
                                    }
                                }}
                                inputRef={wayDateInputRef}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        remarkInputRef.current.focus();
                                    }
                                    // if (e.key === "Enter") {
                                    //     e.preventDefault();
                                    //     customerInputRef.current.focus();
                                    //     handleWaySave();
                                    // }
                                }}
                            />
                            {wayErrors.wayDate && (
                                <p className="text-red-500 text-xs ml-1">{wayErrors.wayDate}</p>
                            )}
                        </div>


                        {/* remark input */}
                        <Input label="Remark" value={mainFormData.remark} name="remark" inputRef={remarkInputRef} onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    remarkInputRef.current.focus();
                                }
                            }}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <div className="flex gap-3">
                        <Button variant="gradient"
                            color="green" onClick={() => handleWaySave()}>
                            Submit
                        </Button>
                        <Button variant="gradient"
                            color="blue" onClick={() => setEditDialog(false)}>
                            Cancel
                        </Button>
                    </div>
                </DialogFooter>
            </Dialog>

            <Dialog
                open={deliveryDialog}
                handler={() => setDeliveryDialog(false)}
                size="xs"
                className="!max-w-[90%] sm:!max-w-md"
            >
                <DialogHeader className="text-xl font-bold text-gray-800">
                    Select Date Range
                </DialogHeader>

                <DialogBody className="flex flex-row gap-4 items-center overflow-visible py-6">
                    {/* === Start Date Input === */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <label className="text-xs font-bold text-blue-gray-500 ml-1 mb-1">Start Date</label>
                        <Input
                            type="datetime-local"
                            label="Select Start Date"
                            name="localStartDate"
                            value={localStartDate}
                            onChange={(e) => setLocalStartDate(e.target.value)}
                            // 💡 shrink attribute ကို true ပေးလိုက်ခြင်းဖြင့် Label ကို အပေါ်သို့ တွန်းတင်ပေးပြီး ထပ်မနေတော့ပါဘူး
                            shrink={true}
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            className="w-full text-sm font-semibold"
                        />
                    </div>
                </DialogBody>

                <DialogFooter className="gap-2">
                    {/* Cancel Button */}
                    <Button
                        color="red"
                        variant="text"
                        onClick={() => setDeliveryDialog(false)}
                    >
                        Cancel
                    </Button>

                    {/* Submit Button */}
                    <Button
                        color="green"
                        onClick={() => {
                            setDeliveryDialog(false);
                            handleTodayAllStatusDelivery();

                            setLocalStartDate("");
                        }}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </Dialog>

        </>
    )
}

export default WayPage;