import Customer from "./customer.js";
import Outlet from "./outlet.js";
import Way from "./way.js";
import DeliArea from "./deliArea.js";
import TownShip from "./township.js";
import DeliAreaTownShip from "./deliAreaTownShip.js";
import Township from "./township.js";
import User from "./user.js";
import Route from "./route.js";

// Way → Customer
Way.belongsTo(Customer, { foreignKey: "customerId" });
Customer.hasMany(Way, { foreignKey: "customerId" });

// Way → Outlet
Way.belongsTo(Outlet, { foreignKey: "outletId" });
Outlet.hasMany(Way, { foreignKey: "outletId" });

// Way → DeliArea
Way.belongsTo(DeliArea, {
  foreignKey: "pickupDeliCar",
  targetKey: "deliAreaId",
  as: "pickupDeliCarArea",
});

Way.belongsTo(Township, { foreignKey: "townShipId", as: "townshipData" });

Way.belongsTo(DeliArea, {
  foreignKey: "senderDeliCar",
  targetKey: "deliAreaId",
  as: "senderDeliCarArea",
});

//DeliArea ↔ TownShip
DeliArea.belongsToMany(TownShip, {
  through: DeliAreaTownShip,
  foreignKey: "deliAreaId",
  otherKey: "townShipId",
  onDelete: "CASCADE", // <--- automatically deletes children
});

TownShip.belongsToMany(DeliArea, {
  through: DeliAreaTownShip,
  foreignKey: "townShipId",
  otherKey: "deliAreaId",
});

// Define relation (1 user → many permissions)
User.hasMany(Route, { foreignKey: "userId" });
Route.belongsTo(User, { foreignKey: "userId" });

export { Customer, Outlet, Way, DeliArea, TownShip, DeliAreaTownShip, User, Route };
