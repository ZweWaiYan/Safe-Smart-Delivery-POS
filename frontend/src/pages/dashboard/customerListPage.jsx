import {
    Card, CardHeader, CardBody, Typography, Chip, IconButton, Button, Dialog, DialogHeader, DialogBody, DialogFooter,
    Input, Select, Option, Tabs, TabsHeader, Tab, Menu, MenuHandler, MenuList, MenuItem, setDeliAreaList, DialogTitle, DialogContent, DialogActions
} from "@material-tailwind/react";
import { useEffect, useState, useRef } from "react";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/api/customerAPI";

import { Bars3Icon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

import { exportCustomerColumns } from "./../../data/initialForm-data";

import { usePermission } from "@/hooks/usePermission";
import handleExportCustomerExcel from "../../widgets/components/handleExportCustomerExcel";
import excel from "../../assets/wayPage/excel.png";

export function CustomerListPage() {

    const { canAdd, canEdit, canDelete } = usePermission("Customer");

    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;

    const [customerList, setcustomerList] = useState([]);
    const [formData, setFormData] = useState({ customerName: "", customerPhone: "", customerAddress: "" });

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ msg: "", status: "" });

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const topRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("0");

    const customerNameRef = useRef(null);
    const customerPhoneRef = useRef(null);
    const customerAddressRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef(null);

    const [errors, setErrors] = useState({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
    });


    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (e) => {
        const value = e.target.value;
        
        setFormData((prev) => ({
            ...prev,
            customerName: value,
        }));

        if (!value.trim()) {
            setShowSuggestions(false);
            return;
        }

        const matches = customerList.filter(
            (o) =>
                o.customerName.toLowerCase().includes(value.toLowerCase()) ||
                o.customerName.includes(value)
        );

        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
    };

    // const filteredList = customerList.filter(({ customerName }) =>
    //     customerName.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    const filteredList = customerList.filter((item) => {
        const query = searchQuery.toLowerCase();

        if (!query) return true;        

        if (filterBy === "1") {
            // Address
            return item.customerAddress?.toLowerCase().includes(query);
        }

        if (filterBy === "2") {
            // Phone
            return item.customerPhone?.toLowerCase().includes(query);
        }

        // Default: Name
        return item.customerName?.toLowerCase().includes(query);
    });

    // Calculate pagination
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredList.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);


    useEffect(() => {
        fetchCustomers().then(setcustomerList).catch((e) => console.error(e));
    }, []);

    useEffect(() => {
        if (activeIndex < 0 || !listRef.current) return;

        const item = listRef.current.children[activeIndex];
        item?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);


    const resetForm = () => {
        setFormData({ customerName: "", customerPhone: "", customerAddress: "" });
        setErrors({ customerName: "", customerPhone: "", customerAddress: "" });
        setEditId(null);
    }

    const openDeleteConfirmDialog = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleAdd = () => {

        resetForm();
        setEditId(null);
        // focus on Customer Name input        
        customerNameRef.current.focus();
    };

    const handleEdit = (id) => {
        const item = customerList.find((d) => d.customerId === id);
        if (!item) return;
        setFormData({ customerName: item.customerName, customerPhone: item.customerPhone, customerAddress: item.customerAddress });
        setEditId(id);

        // smooth scroll to top
        topRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        // focus input after scroll
        setTimeout(() => {
            townShipNameRef.current?.focus();
        }, 300);
    };

    const handleDelete = async () => {
        try {
            const response = await deleteCustomer(deleteId);
            setcustomerList((prev) => prev.filter((c) => c.customerId !== deleteId));
            setDeleteId(null);
            setConfirmOpen(false);
            setAlertMessage({ msg: response.message, status: response.status });
            setAlertOpen(true)
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleSubmit = async (e) => {
        try {
            let response;
            if (editId) {
                response = await updateCustomer(editId, formData);

                if (response.status === 201) {
                    setcustomerList((prevList) =>
                        prevList.map((c) =>
                            c.customerId === response.data.customerId ? response.data : c
                        )
                    );
                    setAlertMessage({ msg: response.message, status: response.status });
                    setAlertOpen(true)
                }
            } else {
                response = await createCustomer(formData);
                if (response.status === 201) {
                    setcustomerList((prev) => [response.data, ...prev]);
                    setCurrentPage(1);
                    setAlertMessage({ msg: response.message, status: response.status });
                    setAlertOpen(true);
                }
            }
            handleCloseDialog(true);
        } catch (err) {
            setAlertMessage({ msg: err.message, status: 500 });
            handleCloseDialog(false);
            setAlertOpen(true);
        }
    };


    const handleCloseDialog = (response) => {
        if (response) {
            resetForm();
        }
    };

    const getPageNumbers = (current, total) => {
        const pages = new Set();

        // Window around current page
        const prevAnchor = Math.floor((current - 1) / 10) * 10;
        const nextAnchor = Math.ceil(current / 10) * 10;

        let start = prevAnchor + 1;
        let end = Math.min(nextAnchor, total);

        for (let i = start; i <= end; i++) {
            pages.add(i);
        }

        // Always include multiples of 10 as anchors
        for (let i = 10; i <= total; i += 10) {
            pages.add(i);
        }

        // Always include last page
        pages.add(total);

        return Array.from(pages).sort((a, b) => a - b);
    };

    const validate = () => {
        let valid = true;
        const newErrors = { customerName: "", customerPhone: "", customerAddress: "" };

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer Name is required";
            valid = false;
        }
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = "Phone is required";
            valid = false;
        }
        if (!formData.customerAddress.trim()) {
            newErrors.customerAddress = "Address is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmitWithValidation = () => {
        if (!validate()) return;
        handleSubmit();
    };

    return (
        <>
            <div ref={topRef}></div>

            <div className="flex flex-col lg:flex-row gap-6 mt-10 mb-8">
                {/* Table */}
                <div className="flex-1">
                    <Card>
                        <CardHeader
                            variant="gradient"
                            color="gray"
                            className="mb-5 p-6 relative z-10 overflow-visible"
                        >
                            <div className="flex items-start justify-between flex-col lg:flex-row lg:items-start gap-4">
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">

                                    <IconButton
                                        variant="text"
                                        color="blue-gray"
                                        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                                        className="self-start sm:self-auto"
                                    >
                                        <Bars3Icon strokeWidth={3} className="h-7 w-7 text-white" />
                                    </IconButton>

                                    {/* <div className="w-full max-w-[24rem] relative flex">
                                        <Input
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className=" appearance-none !bg-gray-800 !border-t-white placeholder:text-white placeholder:opacity-100 focus:!border-gray-700 text-white"
                                            labelProps={{
                                                className: "before:content-none after:content-none !text-white",
                                            }}
                                            containerProps={{
                                                className: "min-w-0",
                                            }}
                                        />
                                    </div> */}

                                    {/* SEARCH */}
                                    <div className="w-full sm:flex-1 sm:max-w-[24rem]">
                                        <Input
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="appearance-none !bg-gray-800 !border-t-white placeholder:text-white placeholder:opacity-100 focus:!border-gray-700 text-white"
                                            labelProps={{
                                                className: "before:content-none after:content-none !text-white",
                                            }}
                                            containerProps={{
                                                className: "w-full",
                                            }}
                                        />
                                    </div>

                                    {/* FILTER */}
                                    <div className="w-full sm:w-44 mr-5">
                                        <Select
                                            label="Filter By"
                                            name="filter"
                                            value={filterBy}
                                            onChange={(value) => setFilterBy(value)}
                                            className="text-white"
                                            labelProps={{
                                                className: "!text-white before:border-white after:border-white",
                                            }}
                                            containerProps={{
                                                className: "min-w-[10rem]",
                                            }}
                                        >
                                            <Option value="0">Name</Option>
                                            <Option value="1">Address</Option>
                                            <Option value="2">Phone</Option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="w-full lg:w-auto flex justify-end">
                                    {canAdd && (
                                        <div className="flex items-center gap-4">
                                            <IconButton color="blue-gray" className="ml-7" onClick={() => {
                                                handleExportCustomerExcel(filteredList, exportCustomerColumns)
                                            }}>
                                                <img src={excel} width={70} alt="Way" />
                                            </IconButton>
                                            <IconButton color="green" className="mr-2" onClick={handleAdd}>
                                                <i className="fas fa-add" />
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">

                            {/* Pagination */}
                            <div className="flex justify-center items-center gap-1 mt-5 mr-5 flex-wrap">
                                {/* Page Numbers */}
                                {getPageNumbers(currentPage, totalPages).map((page, index) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={page === currentPage ? "filled" : "text"}
                                        color={page === currentPage ? "blue" : "gray"}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <table className="w-full mt-8 min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["No", "Name", "Phone", "Address"].map((el) => (
                                            <th
                                                key={el}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-start"
                                            >
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                        <th className="border-b border-blue-gray-50 py-3 px-5 text-start">
                                            {canEdit && canDelete &&
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                >
                                                    Actions
                                                </Typography>}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.map(
                                        ({ customerId, customerName, customerPhone, customerAddress }, key) => {
                                            const className = `py-3 px-5 ${key === currentRows.length - 1 ? "" : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <tr key={customerId}>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {indexOfFirst + key + 1}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {customerName}
                                                        </Typography>
                                                    </td>
                                                    <td className={`${className} min-w-[180px]`}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {customerPhone}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {customerAddress}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <IconButton
                                                                    color="green"
                                                                    onClick={() => handleEdit(customerId)}
                                                                >
                                                                    <i className="fas fa-edit" />
                                                                </IconButton>
                                                            )}
                                                            {canDelete && (
                                                                <IconButton
                                                                    color="red"
                                                                    onClick={() => openDeleteConfirmDialog(customerId)}
                                                                >
                                                                    <i className="fas fa-trash" />
                                                                </IconButton>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                </div>

                {/* Input Form */}
                <div className="w-full lg:w-1/3 mr-2">
                    <div className="flex flex-col gap-5 bg-white p-4 rounded shadow-md">
                        <div className="flex items-center justify-between pb-3 border-b-2">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editId !== null ? "Edit Customer" : "Add New Customer"}
                            </h2>
                            <IconButton
                                size="sm"
                                color="red"
                                variant="text"
                                onClick={resetForm}
                            >
                                <i className="fas fa-eraser text-lg" />
                            </IconButton>
                        </div>
                        {/* <Input
                            label="Customer Name"
                            name="customerName"
                            value={formData.customerName}
                            inputRef={customerNameRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    customerNameRef.current.focus();
                                }
                            }}
                        /> */}


                        <div className="relative w-full">
                            {/* INPUT */}
                            <Input
                                label="Customer Name"
                                name="customerName"
                                value={formData.customerName}
                                inputRef={customerNameRef}
                                onChange={handleChange}
                                // onKeyDown={(e) => {
                                //     if (e.key === "Enter") {
                                //         e.preventDefault();
                                //         handleSubmitWithValidation();
                                //         customerNameRef.current.focus();
                                //     }
                                //     if (e.key === "Tab") {
                                //         e.preventDefault();
                                //         setShowSuggestions(false);
                                //         customerPhoneRef.current.focus();
                                //     }
                                // }}
                                onKeyDown={(e) => {
                                    if (!showSuggestions || suggestions.length === 0) return;

                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setActiveIndex((prev) =>
                                            prev < suggestions.length - 1 ? prev + 1 : 0
                                        );
                                    }

                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setActiveIndex((prev) =>
                                            prev > 0 ? prev - 1 : suggestions.length - 1
                                        );
                                    }

                                    if (e.key === "Enter" && activeIndex >= 0) {
                                        e.preventDefault();
                                        const selected = suggestions[activeIndex];
                                        setFormData((prev) => ({ ...prev, customerName: selected.customerName }));
                                        setShowSuggestions(false);
                                        customerPhoneRef.current.focus();
                                    }

                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        setShowSuggestions(false);
                                        customerPhoneRef.current.focus();
                                    }
                                }}
                            />

                            {/* DROPDOWN */}
                            {showSuggestions && (
                                <div
                                    ref={listRef}
                                    className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                >
                                    {suggestions.map((c, index) => (
                                        <div
                                            key={c.customerId}
                                            className={`px-3 py-2 cursor-pointer border-b border-gray-200 last:border-b-0
                    ${index === activeIndex ? "bg-gray-100" : "hover:bg-gray-100"}`}
                                        >
                                            <div className="text-sm mb-1.5 font-medium">{c.customerName}</div>
                                            <div className="text-xs mb-1 text-gray-500">{c.customerAddress}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.customerName && (
                            <span className="text-red-500 text-xs">{errors.customerName}</span>
                        )}
                        <Input
                            label="Phone"
                            name="customerPhone"
                            value={formData.customerPhone}
                            inputRef={customerPhoneRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    customerNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.customerPhone && (
                            <span className="text-red-500 text-xs">{errors.customerPhone}</span>
                        )}
                        <Input
                            label="Address"
                            name="customerAddress"
                            value={formData.customerAddress}
                            inputRef={customerAddressRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    customerNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.customerAddress && (
                            <span className="text-red-500 text-xs ">{errors.customerAddress}</span>
                        )}
                    </div>

                    {alertOpen && (
                        <div
                            className={`mt-5 p-4 rounded shadow-md ${alertMessage.status === 201
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {alertMessage.msg}
                        </div>
                    )}

                </div>
            </div>

            <Dialog open={confirmOpen} handler={() => setConfirmOpen(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm">
                <DialogHeader className="text-red-500">Confirm Deletion</DialogHeader>
                <DialogBody className="text-lg font-semibold text-blue-gray-600">
                    Are you sure you want to delete this customer record?
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" className="mr-2" color="gray" onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="gradient" color="red" onClick={() => handleDelete()}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

export default CustomerListPage;
