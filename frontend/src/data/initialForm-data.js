export const initialWayFormData = {
  outletId: 0, customerId: 0, itemPrice: 0, deliFee: 0, status: 1, itemQty: 0, wayType: 0, marketId: 0, marketName: "", pickupDeliCar: 0, senderDeliCar: 0, city: 0, townShipId: 0, wayDate: "", remark: "", complaint: "",
};

export const resetOSWayFormData = { 
  customerId: 0, itemPrice: 0, deliFee: 0, status: 1, itemQty: 0, senderDeliCar: 0, city: 0, townShipId: 0, wayDate: "", remark: "", complaint: "",
 };

 export const resetOutletWayFormData = { 
  outletId: 0, customerId: 0, itemPrice: 0, deliFee: 0, status: 1, itemQty: 0, pickupDeliCar: 0, senderDeliCar: 0, city: 0, townShipId: 0, wayDate: "", remark: "", complaint: "",
 };

export const initialOutletFormData = {
  outletId: 0, outletName: "", outletPhone: "", outletAddress: "", outletType: 3, marketId: 0, marketName: "",
};

export const initialCustomerFormData = {
  customerId: 0, customerName: "", customerPhone: "", customerAddress: ""
};

export const initialMarketFormData = {
  marketId: 0, marketName: "",
};

export const initialFilterFormDate = {
   customer: "", outletName: "", startDate: "" , endDate: "", status: 0, townShip: 0, senderDeliCar: 0, sortBy: "", city: 0, wayType: 3, market: 0, packageFee : ""
};

    export const exportColumns = [
        { header: "No", key: "no", width: 10, alignment: { horizontal: "left" } },
        { header: "Outlet", key: "outlet", width: 10, alignment: { horizontal: "left" } },
        { header: "Customer", key: "customer", width: 20, alignment: { horizontal: "left" } },
        { header: "Price", key: "price", width: 20, alignment: { horizontal: "left" } },
        { header: "DeliFee", key: "deliFee", width: 15, alignment: { horizontal: "center" } },
        { header: "Phone", key: "phone", width: 25, alignment: { horizontal: "left" } },
        { header: "Township", key: "township", width: 15, alignment: { horizontal: "right" } },
        { header: "Address", key: "address", width: 15, alignment: { horizontal: "right" } },        
        { header: "Remark", key: "remark", width: 15, alignment: { horizontal: "right" } },
    ];


        export const exportOutletColumns = [
        { header: "No", key: "no", width: 10, alignment: { horizontal: "left" } },
        { header: "Name", key: "name", width: 10, alignment: { horizontal: "left" } },
        { header: "Phone", key: "phone", width: 20, alignment: { horizontal: "left" } },
        { header: "Address", key: "address", width: 20, alignment: { horizontal: "left" } },        
    ];

     export const exportCustomerColumns = [
        { header: "No", key: "no", width: 10, alignment: { horizontal: "left" } },
        { header: "Name", key: "name", width: 10, alignment: { horizontal: "left" } },
        { header: "Phone", key: "phone", width: 20, alignment: { horizontal: "left" } },
        { header: "Address", key: "address", width: 20, alignment: { horizontal: "left" } },        
    ];
