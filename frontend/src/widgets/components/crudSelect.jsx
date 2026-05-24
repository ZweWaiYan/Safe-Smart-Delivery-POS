import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Button,
  Popover,
  PopoverHandler,
  PopoverContent,
  IconButton,
} from "@material-tailwind/react";
import { fetchTownShip, createTownShip, updateTownShip, deleteTownShip } from "@/api/townShipAPI";
import { Plus, Check, X } from "lucide-react";

const CrudSelect = forwardRef(({ onChange, deliCarTownShipId, deliCarTownShipName }, ref) => {
  const [townShip, setTownShip] = useState([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    fetchTownShip()
      .then((data) => {
        const dataWithCheck = data.map(item => ({
          ...item,
          checked: deliCarTownShipId?.includes(item.townShipId) || false,
        }));
        setTownShip(dataWithCheck);
      })
      .catch((e) => console.error(e));
  }, [deliCarTownShipId]);

  // Expose resetSelection to parent
  useImperativeHandle(ref, () => ({
    resetSelection: () => {
      setTownShip(prev => prev.map(item => ({ ...item, checked: false })));
      onChange && onChange([]);
    }
  }));

  const toggleCheck = (townShipId) => {
    setTownShip((prev) => {
      const updated = prev.map((item) =>
        item.townShipId === townShipId
          ? { ...item, checked: !item.checked }
          : item
      );
      onChange && onChange(updated.filter(i => i.checked).map(i => i.townShipId));
      return updated;
    });
  }; 

  const handleEditSave = async (townShipId) => {
    if (!editingText.trim()) return;
    try {
      const res = await updateTownShip(townShipId, { townShipName: editingText.trim() });
      if (res?.status >= 200 && res?.status < 300) {
        const updatedName = res?.data?.townShipName ?? editingText.trim();
        setTownShip((prev) =>
          prev.map((item) =>
            item.townShipId === townShipId ? { ...item, townShipName: updatedName } : item
          )
        );
        setEditingId(null);
        setEditingText("");
      } else {
        console.error("Update failed:", res);
      }
    } catch (error) {
      console.error("Failed to update township:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText("");
  };

  const changingInput = () => {
    setNewItem("");
    inputRef.current.focus();
  };

  const filteredItems = townShip.filter(({ townShipName }) =>
    townShipName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Popover open={open} handler={setOpen} placement="bottom-start">
        <PopoverHandler>
          <Button
            variant="outlined"
            fullWidth
            className="flex justify-between items-center"
          >
            <span style={{ fontWeight: 400, lineHeight: "1.2" }}>
              {deliCarTownShipId && deliCarTownShipId.length > 0
                ? townShip
                  .filter(i => deliCarTownShipId.includes(i.townShipId))
                  .map(i => i.townShipName)
                  .join(", ")
                : townShip.filter(i => i.checked).map(i => i.townShipName).join(", ") || "Select Or Type"}
            </span>
          </Button>


        </PopoverHandler>

        <PopoverContent className="w-80 p-2 flex flex-col gap-2">
          {/* New item input */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search TownShip"
              className="flex-1 border rounded p-2 h-12"
              autoFocus             
              ref={inputRef}
            />          
          </div>

          {/* Scrollable township list */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.townShipId}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.townShipId)}
                    className="h-4 w-4"
                  />
                  {editingId === item.townShipId ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(item.townShipId);
                        if (e.key === "Escape") handleEditCancel();
                      }}
                      className="flex-1 border rounded p-1"
                      autoFocus
                    />
                  ) : (
                    <span>{item.townShipName}</span>
                  )}
                </div>                
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export default CrudSelect;
