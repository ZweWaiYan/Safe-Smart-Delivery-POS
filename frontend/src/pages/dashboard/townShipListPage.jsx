import {
    Card, CardHeader, CardBody, Typography, Chip, IconButton, Button, Dialog, DialogHeader, DialogBody, DialogFooter,
    Input, Select, Option, Tabs, TabsHeader, Tab, Menu, MenuHandler, MenuList, MenuItem, setDeliAreaList, DialogTitle, DialogContent, DialogActions
} from "@material-tailwind/react";
import { useEffect, useState, useRef } from "react";
import { fetchMarket, createMarket, updateMarket, deleteMarket } from "@/api/marketAPI";

import { Bars3Icon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

import { usePermission } from "@/hooks/usePermission";
import { createTownShip, deleteTownShip, fetchTownShip, updateTownShip } from "@/api/townShipAPI";

export function TownshipListPage() {

    const { canAdd, canEdit, canDelete } = usePermission("TownShip");

    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;

    const [townShipList, setTownShipList] = useState([]);
    const [formData, setFormData] = useState({ townShipName: "" });

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ msg: "", status: "" });

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");

    const topRef = useRef(null);
    const townShipNameRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [errors, setErrors] = useState({
        townShipName: "",
    });

    const filteredList = townShipList.filter(({ townShipName }) =>
        townShipName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredList.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);


    useEffect(() => {
        fetchTownShip().then(setTownShipList).catch((e) => console.error(e));
    }, []);

    const resetForm = () => {
        setFormData({ townShipName: "" });
        setErrors({ townShipName: "" });
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
        townShipNameRef.current.focus();
    };

    const handleEdit = (id) => {
        const item = townShipList.find((d) => d.townShipId === id);
        if (!item) return;
        setFormData({ townShipName: item.townShipName, });
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
            const response = await deleteTownShip(deleteId);
            setTownShipList((prev) => prev.filter((c) => c.townShipId !== deleteId));
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
                response = await updateTownShip(editId, formData);

                if (response.status === 201) {
                    setTownShipList((prevList) =>
                        prevList.map((c) =>
                            c.townShipId === response.data.townShipId ? response.data : c
                        )
                    );
                    setAlertMessage({ msg: response.message, status: response.status });
                    setAlertOpen(true)
                }
            } else {
                response = await createTownShip(formData);
                if (response.status === 201) {
                    setTownShipList((prev) => [response.data, ...prev]);
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
        const newErrors = { townShipName: "" };

        if (!formData.townShipName.trim()) {
            newErrors.townShipName = "Township Name is required";
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
                                <div className="flex">
                                    <div className="pr-6">
                                        <IconButton
                                            variant="text"
                                            color="blue-gray"
                                            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                                        >
                                            <Bars3Icon strokeWidth={3} className="h-7 w-7 text-white" />
                                        </IconButton>
                                    </div>
                                    <div className="w-full max-w-[24rem] relative flex">
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
                                    </div>
                                </div>
                                <div className="w-full lg:w-auto flex justify-end">
                                    {canAdd && (
                                        <IconButton color="green" className="ml-7 mr-4" onClick={handleAdd}>
                                            <i className="fas fa-add" />
                                        </IconButton>
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
                                        {["No", "Name"].map((el) => (
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
                                        ({ townShipId, townShipName, }, key) => {
                                            const className = `py-3 px-5 ${key === currentRows.length - 1 ? "" : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <tr key={townShipId}>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {indexOfFirst + key + 1}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {townShipName}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <IconButton
                                                                    color="green"
                                                                    onClick={() => {

                                                                        handleEdit(townShipId)
                                                                    }}
                                                                >
                                                                    <i className="fas fa-edit" />
                                                                </IconButton>
                                                            )}
                                                            {canDelete && (
                                                                <IconButton
                                                                    color="red"
                                                                    onClick={() => openDeleteConfirmDialog(townShipId)}
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
                                {editId !== null ? "Edit Township" : "Add New Township"}
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
                        <Input
                            label="Township Name"
                            name="townShipName"
                            value={formData.townShipName}
                            inputRef={townShipNameRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    townShipNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.marketName && (
                            <span className="text-red-500 text-xs">{errors.townShipName}</span>
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
                    Are you sure you want to delete this townShip record?
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

export default TownshipListPage;
