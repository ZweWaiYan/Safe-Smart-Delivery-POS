export const mainHeaders = [
  "No",
  "outlet",
  "customer",
  "package Fee",  
  "deli Fee",
  "status",
  // "itemQty",
  "townshipName",
  // "wayType",  
  "wayDate",
  "remark",
  "Action",
];

export const outletHeaders = [  
  "outlet",
  "customer",
  "package Fee",
  "deli Fee",
  // "itemQty",
  "deliCar",
  "remark",
  "Action",
];

export const osHeaders = [  
  "outlet",
  "customer",
  "package Fee",
  "deli Fee",
  // "itemQty",
  "deliCar",
  "remark",
  "Action",
];

export const deliveryStatusList = [
    { label: "All", value: 0 },
  { label: "Working", value: 1 },
  { label: "Waiting", value: 2 },
  { label: "Rest", value: 3 },
  { label: "Repair", value: 4 },
  { label: "Absent", value: 5 },
]

export const statusList = [
  { label: "All", value: 0 },
  { label: "Pickup", value: 1 },      
  { label: "Date Changed", value: 2 },
  { label: "Pending", value: 3 },
  { label: "Return", value: 4 },    
  { label: "Delivered", value: 5 },
];

export const wayTypeList = [
    { label: "Outlet", value: 0 },
    { label: "OS", value: 1 },
]

export const userRoles = [
   { label: "Admin" , value: 1},
   { label: "Data Entry" , value: 2},
]

export const routesList = [
  { label: "Dashboard" , value : 1},
  { label: "Way" , value : 2}, //
  { label: "Delivery" , value : 3}, 
  { label: "Customer" , value : 4}, //
  { label: "Outlet" , value : 5}, //
  { label: "Deli Car" , value : 6}, //
  { label: "Market" , value : 7}, //
  { label: "User" , value : 8}, //
  { label: "TownShip" , value : 9}, //
]

export const mmRegions = [
  { regionId: 0, regionName: 'All' },
  { regionId: 1, regionName: 'ရန်ကုန်တိုင်းဒေသကြီး' },
  { regionId: 2, regionName: 'မန္တလေးတိုင်းဒေသကြီး'},
  { regionId: 3, regionName: 'ဧရာဝတီတိုင်းဒေသကြီး'},
  { regionId: 4,regionName: 'ပဲခူးတိုင်း'},
  { regionId: 5, regionName: 'ချင်းပြည်နယ်'},
  { regionId: 6, regionName: 'ကချင်ပြည်နယ်'},
  { regionId: 7, regionName: 'ကယားပြည်နယ်' },
  { regionId: 8, regionName: 'ကရင်ပြည်နယ်'},
  { regionId: 9, regionName: 'မကွေးတိုင်း'},  
  { regionId: 10,  regionName: 'မွန်ပြည်နယ်'},
  { regionId: 11, regionName: 'နေပြည်တော်'},
  { regionId: 12,  regionName: 'ရခိုင်ပြည်နယ်' },
  { regionId: 13, regionName: 'စစ်ကိုင်းတိုင်း' },
  { regionId: 14, regionName: 'ရှမ်းပြည်နယ်' },
  { regionId: 15, regionName: 'တနင်္သာရီတိုင်း' },  
]

export const filterOrderTypeTabLists = [
  { label: "All", value: 3 },
  { label: "Outlet", value: 0 },
  { label: "OS", value: 1 },
]

export const onlineBaseURL = "http://192.168.100.14:5000/api";