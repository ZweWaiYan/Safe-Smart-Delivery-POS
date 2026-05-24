import {
    Card, CardHeader, CardBody, Typography, IconButton, Button, Dialog, DialogHeader, DialogBody, DialogFooter,
    Input, Select, Option, Menu, MenuHandler, MenuList, MenuItem
} from "@material-tailwind/react";
import ReactSelect from 'react-select';
import { useEffect, useState, useRef } from "react";
import { fetchOutlet, createOutlet, updateOutlet, deleteOutlet } from "@/api/outletAPI";
import { fetchMarket } from "@/api/marketAPI";

import { exportOutletColumns } from "../../data/initialForm-data";

import { Bars3Icon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

import { usePermission } from "@/hooks/usePermission";

import handleExportOutletExcel from "../../widgets/components/handleExportOutletExcel";
import excel from "../../assets/wayPage/excel.png";

export function OutletListPage() {

    const { canAdd, canEdit, canDelete } = usePermission("Outlet");

    const [controller, dispatch] = useMaterialTailwindController();
    const { openSidenav } = controller;

    const [outletList, setOutletList] = useState([]);
    const [marketList, setMarketList] = useState([]);
    const [formData, setFormData] = useState({ outletName: "", outletPhone: "", outletAddress: "", outletType: 3, marketId: 0, marketName: "" });

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ msg: "", status: "" });

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const topRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("0");

    const outletNameRef = useRef(null);
    const outletPhoneRef = useRef(null);
    const outletAddressRef = useRef(null);
    const outletTypeRef = useRef(null);
    const marketInputRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [errors, setErrors] = useState({
        outletName: "",
        outletPhone: "",
        outletAddress: "",
        outletType: "",
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch outlets on mount
    useEffect(() => {
        fetchOutlet().then(setOutletList).catch((e) => console.error(e));
        fetchMarket().then(setMarketList).catch((e) => console.error(e));
    }, []);

    useEffect(() => {
        if (activeIndex < 0 || !listRef.current) return;

        const item = listRef.current.children[activeIndex];
        item?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);


    // Handle input changes and suggestions
    const handleChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, outletName: value }));

        if (!value.trim()) {
            setShowSuggestions(false);
            return;
        }

        const matches = outletList.filter(
            (o) =>
                o.outletName.toLowerCase().includes(value.toLowerCase()) ||
                o.outletPhone.includes(value)
        );

        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
    };

    // const handleInputChange = (e) => {
    //     const { value, name } = e.target;
    //     setFormData({ ...formData, [name]: value });
    //     setErrors({ ...errors, [name]: "" });
    // };

    const handleInputChange = (e) => {
        // ပုံမှန် Input တွေအတွက် (e.target ပါရင်)
        if (e.target) {
            const { value, name } = e.target;
            setFormData({ ...formData, [name]: value });
            setErrors({ ...errors, [name]: "" });
        }
        // React Select လိုမျိုး Object တိုက်ရိုက်လာရင်
        else {
            setFormData({ ...formData, ...e });
        }
    };

    const resetForm = () => {
        setFormData({ outletName: "", outletPhone: "", outletAddress: "", outletType: 3 });
        setErrors({ outletName: "", outletPhone: "", outletAddress: "", outletType: "" });
        setEditId(null);
    };

    const handleAdd = () => {
        resetForm();
        setEditId(null);
        outletNameRef.current.focus();
    };

    const handleEdit = (id) => {
        const item = outletList.find((d) => d.outletId === id);
        if (!item) return;
        setFormData({ outletName: item.outletName, outletPhone: item.outletPhone, outletAddress: item.outletAddress, outletType: item.outletType });
        setEditId(id);

        //  smooth scroll to top
        topRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        //  focus input after scroll
        setTimeout(() => {
            townShipNameRef.current?.focus();
        }, 300);
    };

    const handleDelete = async () => {
        try {
            const response = await deleteOutlet(deleteId);
            setOutletList((prev) => prev.filter((c) => c.outletId !== deleteId));
            setDeleteId(null);
            setConfirmOpen(false);
            setAlertMessage({ msg: response.message, status: response.status });
            setAlertOpen(true)
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleSubmit = async () => {        
        try {
            let response;
            if (editId) {
                response = await updateOutlet(editId, formData);
                if (response.status === 201) {
                    setOutletList((prevList) =>
                        prevList.map((c) =>
                            c.outletId === response.data.outletId ? response.data : c
                        )   
                    );
                    setAlertMessage({ msg: response.message, status: response.status });
                    setAlertOpen(true)
                }
            } else {
                response = await createOutlet(formData);
                if (response.status === 201) {
                    // ✅ Prepend new outlet
                    setOutletList((prev) => [response.data, ...prev]);
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
        if (response) resetForm();
    };

    const validate = () => {
        let valid = true;
        const newErrors = { outletName: "", outletPhone: "", outletAddress: "", outletType: "" };

        if (!formData.outletName.trim()) {
            newErrors.outletName = "Outlet Name is required";
            valid = false;
        }
        if (!formData.outletPhone.trim()) {
            newErrors.outletPhone = "Phone is required";
            valid = false;
        }
        if (!formData.outletAddress.trim()) {
            newErrors.outletAddress = "Address is required";
            valid = false;
        }
        if (formData.outletType === 3) {
            newErrors.outletType = "Type is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmitWithValidation = () => {
        if (!validate()) return;
        handleSubmit();
    };

    // Pagination
    // const filteredList = outletList.filter(({ outletName }) => {    
    //     return outletName.toLowerCase().includes(searchQuery.toLowerCase())
    // });

    const filteredList = outletList.filter((item) => {
        
        const query = searchQuery.toLowerCase();

        if (!query) return true;

        if (filterBy === "1") {
            // Address
            return item.outletAddress?.toLowerCase().includes(query);
        }

        if (filterBy === "2") {
            // Phone
            return item.outletPhone?.toLowerCase().includes(query);
        }

        // Default: Name
        return item.outletName?.toLowerCase().includes(query);
    });


    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredList.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);

    const getPageNumbers = (current, total) => {
        const pages = new Set();

        const prevAnchor = Math.floor((current - 1) / 10) * 10;
        const nextAnchor = Math.ceil(current / 10) * 10;

        let start = prevAnchor + 1;
        let end = Math.min(nextAnchor, total);

        for (let i = start; i <= end; i++) {
            pages.add(i);
        }

        for (let i = 10; i <= total; i += 10) {
            pages.add(i);
        }

        pages.add(total);

        return Array.from(pages).sort((a, b) => a - b);
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
                                    {/* MENU ICON */}
                                    <IconButton
                                        variant="text"
                                        color="blue-gray"
                                        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                                        className="self-start sm:self-auto"
                                    >
                                        <Bars3Icon strokeWidth={3} className="h-7 w-7 text-white" />
                                    </IconButton>

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
                                                handleExportOutletExcel(filteredList, exportOutletColumns)
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
                                {getPageNumbers(currentPage, totalPages).map((page) => (
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
                                        {["No", "Name", "Phone", "Address", "Market"].map((el) => (
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
                                        ({ outletId, outletName, outletPhone, outletAddress, marketName }, key) => {
                                            const className = `py-3 px-5 ${key === currentRows.length - 1 ? "" : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <tr key={outletId}>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {indexOfFirst + key + 1}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {outletName}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {outletPhone}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {outletAddress}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {marketName}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <IconButton
                                                                    color="green"
                                                                    onClick={() => handleEdit(outletId)}
                                                                >
                                                                    <i className="fas fa-edit" />
                                                                </IconButton>
                                                            )}
                                                            {canDelete && (
                                                                <IconButton
                                                                    color="red"
                                                                    onClick={() => setConfirmOpen(true) & setDeleteId(outletId)}
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
                                {editId !== null ? "Edit Outlet" : "Add New Outlet"}
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

                        <div className="relative w-full">
                            <Input
                                label="Name"
                                name="outletName"
                                value={formData.outletName}
                                inputRef={outletNameRef}
                                onChange={handleChange}
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
                                        setFormData((prev) => ({ ...prev, outletName: selected.outletName }));
                                        setShowSuggestions(false);
                                        outletPhoneRef.current.focus();
                                    }

                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        setShowSuggestions(false);
                                        outletPhoneRef.current.focus();
                                    }
                                }}
                            />
                            {showSuggestions && (
                                <div
                                    ref={listRef}
                                    className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                >
                                    {suggestions.map((o, index) => (
                                        <div
                                            key={o.outletId}
                                            className={`px-3 py-2 cursor-pointer border-b border-gray-200 last:border-b-0
                    ${index === activeIndex ? "bg-gray-100" : "hover:bg-gray-100"}`}
                                        >
                                            <div className="text-sm mb-1.5 font-medium">{o.outletName}</div>
                                            <div className="text-xs mb-1 text-gray-500">{o.outletAddress}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                        {errors.outletName && <span className="text-red-500 text-xs">{errors.outletName}</span>}

                        <Input
                            label="Phone"
                            name="outletPhone"
                            value={formData.outletPhone}
                            inputRef={outletPhoneRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    outletNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.outletPhone && <span className="text-red-500 text-xs">{errors.outletPhone}</span>}

                        <Select
                            label="Select Or Type"
                            name="outletType"
                            value={formData.outletType === 3 ? "" : formData.outletType.toString()}
                            onChange={(value) => {
                                setFormData((prev) => ({ ...prev, outletType: parseInt(value) }));
                            }}
                            ref={outletTypeRef}
                        >
                            <Option value="0">Outlet</Option>
                            <Option value="1">OS</Option>
                        </Select>
                        {errors.outletType && <span className="text-red-500 text-xs">{errors.outletType}</span>}

                        <ReactSelect
                            options={marketList
                                .filter((item) => item.marketId !== 0)
                                .map((item) => ({
                                    value: item.marketId,
                                    label: item.marketName,
                                }))}

                            value={
                                marketList
                                    .filter((item) => item.marketId !== 0)
                                    .map((item) => ({
                                        value: item.marketId,
                                        label: item.marketName,
                                    }))
                                    .find((opt) => opt.value === formData.marketId) || null
                            }

                            onChange={(selectedOption) => {

                                handleInputChange({
                                    marketId: selectedOption ? selectedOption.value : null,
                                    marketName: selectedOption ? selectedOption.label : "",
                                });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    outletAddressRef.current.focus();
                                }
                                // if (e.key === "Enter") {
                                //     e.preventDefault();
                                //     customerInputRef.current.focus();
                                //     handleWaySave();
                                // }
                            }}
                            ref={marketInputRef}
                            isClearable
                            placeholder="Select Market"
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
                        {errors.outletType && <span className="text-red-500 text-xs">{errors.outletType}</span>}

                        <Input
                            label="Address"
                            name="outletAddress"
                            value={formData.outletAddress}
                            inputRef={outletAddressRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    outletNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.outletAddress && <span className="text-red-500 text-xs">{errors.outletAddress}</span>}
                    </div>

                    {alertOpen && (
                        <div
                            className={`mt-5 p-4 rounded shadow-md ${alertMessage.status === 201 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                            {alertMessage.msg}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={confirmOpen} handler={() => setConfirmOpen(false)} size="xs" className="!max-w-[90%] sm:!max-w-sm">
                <DialogHeader className="text-red-500">Confirm Deletion</DialogHeader>
                <DialogBody className="text-lg font-semibold text-blue-gray-600">
                    Are you sure you want to delete this outlet record?
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" className="mr-2" color="gray" onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="gradient" color="red" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

export default OutletListPage;
