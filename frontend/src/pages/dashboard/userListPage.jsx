import {
    Card, CardHeader, CardBody, Typography, Chip, IconButton, Button, Dialog, DialogHeader, DialogBody, DialogFooter,
    Input, Select, Option, Tabs, TabsHeader, Tab, Menu, MenuHandler, MenuList, MenuItem, setDeliAreaList, DialogTitle, DialogContent, DialogActions
} from "@material-tailwind/react";
import { useEffect, useState, useRef } from "react";
import { fetchUsers, createUser, updateUser, deleteUser } from "@/api/userAPI";
import { updateRoute, createRoute, deleteRoutesByUser } from "@/api/routeAPI";

import { Bars3Icon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { routesList } from "@/data/local-data";

import { userRoles } from "../../data/local-data";

import toast from "react-hot-toast";

import { usePermission } from "@/hooks/usePermission";

export function UserListPage() {

    const { canAdd, canEdit, canDelete } = usePermission("User");

    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;

    const [userList, setUserList] = useState([]);
    const [formData, setFormData] = useState({ userName: "", userPhone: "", userPosition: 0, userPassword: "" });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ msg: "", status: "" });

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [permissionId, setPermissionId] = useState(null);

    const topRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [routeIdMap, setRouteIdMap] = useState({});

    const userNameRef = useRef(null);
    const userPhoneRef = useRef(null);
    const userPositionRef = useRef(null);
    const userPasswordRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [errors, setErrors] = useState({
        userName: "",
        userPhone: "",
        userPosition: "",
        userPassword: "",
    });

    const handlePermissionChange = async (userId, pageRoute, field, value) => {

        const targetUser = userList.find(u => u.userId === userId);
        const targetRoute = targetUser?.Routes.find(r => r.pageRoute === pageRoute);

        setUserList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? {
                        ...user,
                        Routes: user.Routes.map(r =>
                            r.pageRoute === pageRoute ? { ...r, [field]: value } : r
                        )
                    }
                    : user
            )
        );



        const res = await updateRoute(targetRoute?.routeId, { [field]: value });
        if (res.status === 201) {
            toast.success(res.data.message);
        } else {
            toast.error("Something is wrong!");
        }

    };

    const filteredList = userList.filter(({ userName }) =>
        userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredList.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);

    useEffect(() => {
        fetchUsers().then(setUserList).catch((e) => console.error(e));
    }, []);

    const resetForm = () => {
        setFormData({ userName: "", userPhone: "", userPosition: 0, userPassword: "" });
        setErrors({ userName: "", userPhone: "", userPosition: "", userPassword: "" });
        setEditId(null);
    }

    const openDeleteConfirmDialog = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const openPermissionDialog = (id) => {
        setPermissionId(id);
        setPermissionOpen(true);
    }

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleAdd = () => {

        resetForm();
        setEditId(null);
        // focus on Customer Name input        
        userNameRef.current.focus();
    };

    const handleEdit = (id) => {
        const item = userList.find((d) => d.userId === id);
        if (!item) return;
        setFormData({ userName: item.userName, userPhone: item.userPhone, userPosition: item.userPosition, userPassword: item.userPassword });
        setEditId(id);

        // smooth scroll to top
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
            const response = await deleteUser(deleteId);
            if (response.status === 201) {
                await deleteRoutesByUser(deleteId);
            }
            setUserList((prev) => prev.filter((c) => c.userId !== deleteId));
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
                response = await updateUser(editId, formData);


                if (response.status === 201) {
                    setUserList((prevList) =>
                        prevList.map((c) =>
                            c.userId === response.data.userId ? response.data : c
                        )
                    );
                    setAlertMessage({ msg: response.message, status: response.status });
                    setAlertOpen(true)
                }
            } else {
                response = await createUser(formData);
                if (response.status === 201) {
                    await createRoute({ userId: response.data.userId });
                    await fetchUsers().then(setUserList).catch((e) => console.error(e));
                    // setUserList((prev) => [...prev, response.data]);
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
        const newErrors = { userName: "", userPhone: "", userPosition: "", userPassword: "" };

        if (!formData.userName.trim()) {
            newErrors.userName = "Name is required";
            valid = false;
        }
        if (!formData.userPhone.trim()) {
            newErrors.userPhone = "Phone is required";
            valid = false;
        }
        if (!formData.userPosition === 0) {
            newErrors.userPosition = "Position is required";
            valid = false;
        }
        if (!formData.userPassword === 0) {
            newErrors.userPassword = "Password is required";
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
                                            className="appearance-none !bg-gray-800 !border-t-white placeholder:text-white placeholder:opacity-100 focus:!border-gray-700 text-white"
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
                                        {["No", "Name", "Phone", "Position", "Password"].map((el) => (
                                            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-start">
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                        <th className="border-b border-blue-gray-50 py-3 px-5 text-start">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                Actions
                                            </Typography>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.map(
                                        ({ userId, userName, userPhone, userPosition }, key) => {                                            
                                            const className = `py-3 px-5 ${key === currentRows.length - 1 ? "" : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <tr key={userId}>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {indexOfFirst + key + 1}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {userName}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {userPhone}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-sm font-semibold text-blue-gray-600">
                                                            {userRoles[userPosition - 1].label}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <IconButton
                                                                    color="green"
                                                                    disabled={userPosition === 1}
                                                                    onClick={() => handleEdit(userId)}
                                                                >
                                                                    <i className="fas fa-edit" />
                                                                </IconButton>
                                                            )}

                                                            {canDelete && (
                                                                <IconButton
                                                                    color="red"
                                                                    disabled={userPosition === 1}
                                                                    onClick={() => openDeleteConfirmDialog(userId)}
                                                                >
                                                                    <i className="fas fa-trash" />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                color="blue"
                                                                disabled={userPosition === 1}
                                                                onClick={() => openPermissionDialog(userId)}
                                                            >
                                                                <i className="fas fa-list" />
                                                            </IconButton>
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
                                {editId !== null ? "Edit User" : "Add New User"}
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
                            label="Name"
                            name="userName"
                            value={formData.userName}
                            inputRef={userNameRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    userPhoneRef.current.focus();
                                }
                            }}
                        />
                        {errors.userName && (
                            <span className="text-red-500 text-xs">{errors.userName}</span>
                        )}
                        <Input
                            label="Phone"
                            name="userPhone"
                            value={formData.userPhone}
                            inputRef={userPhoneRef}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    userPositionRef.current.focus();
                                }
                            }}
                        />
                        {errors.userPhone && (
                            <span className="text-red-500 text-xs">{errors.userPhone}</span>
                        )}
                        <Select
                            label="Select Position"
                            name="userPosition"
                            value={formData.userPosition === 0 ? "" : formData.userPosition.toString()}
                            onChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    userPosition: parseInt(value),
                                }));
                            }}
                            ref={userPositionRef}
                            tabIndex={0}
                            onFocus={(e) => {
                                // when select gets focus via Tab, simulate Space to open dropdown
                                const event = new KeyboardEvent("keydown", { key: " " });
                                e.target.dispatchEvent(event);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "tab") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    userPasswordRef.current.focus();
                                }
                            }}
                        >
                            {userRoles?.slice(1).map((role, index) => (
                                <Option key={role.value ?? index.toString()} value={role.value.toString()}>
                                    {role.label}
                                </Option>
                            ))}

                        </Select>
                        {errors.userPosition && (
                            <span className="text-red-500 text-xs ">{errors.userPosition}</span>
                        )}
                        <Input
                            label="Password"
                            name="userPassword"
                            disabled={editId !== null}
                            value={formData.userPassword}
                            inputRef={userPasswordRef}
                            onChange={handleInputChange}
                            maxLength={20}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmitWithValidation();
                                    userNameRef.current.focus();
                                }
                            }}
                        />
                        {errors.userPassword && (
                            <span className="text-red-500 text-xs">{errors.userPassword}</span>
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
                    Are you sure you want to delete this user record?
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

            <Dialog
                open={permissionOpen}
                handler={() => setPermissionOpen(false)}
                size="xs"
                className="!max-w-[90%] sm:!max-w-sm"
            >
                <DialogHeader className="text-blue-500">Permission Routes</DialogHeader>

                <DialogBody
                    className="text-blue-gray-600"
                    style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}
                >
                    {userList
                        .filter((user) => user.userId === permissionId)
                        .map((user) => (
                            <div key={user.userId} className="mb-8">
                                <h3 className="font-bold text-lg text-blue-700 mb-4">{user.userName}</h3>

                                <div className="border-l border-blue-gray-100 pl-4">
                                    {user.Routes.map((route) => (

                                        <div
                                            key={route.pageRoute - 1}
                                            className="mb-6 pb-3 border-b border-blue-gray-100 last:border-none last:pb-0"
                                        >
                                            {/* Main route checkbox */}
                                            <label className="flex items-center gap-2 pl-3 mb-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-500 accent-blue-600"
                                                    checked={route.canView}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            user.userId,
                                                            route.pageRoute,
                                                            "canView",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <span className="font-semibold text-blue-600 capitalize">
                                                    {routesList[route.pageRoute - 1]?.label}
                                                </span>
                                            </label>

                                            {/* CRUD checkboxes */}
                                            <div className="flex flex-wrap gap-4 pl-3 ml-10">
                                                {["canAdd", "canEdit", "canDelete"].map((action) => (
                                                    <label
                                                        key={action}
                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-blue-500 accent-blue-600"
                                                            checked={route[action] ?? false}
                                                            disabled={!route.canView}
                                                            onChange={(e) =>
                                                                handlePermissionChange(
                                                                    user.userId,
                                                                    route.pageRoute,
                                                                    action,
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                        <span className={route.canView ? "" : "text-gray-400"}>
                                                            {action.replace("can", "")}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}


                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="text" color="gray" onClick={() => setPermissionOpen(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>



        </>
    );
}

export default UserListPage;