import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Radio,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { statusList } from "../../data/local-data";

export const StatusDialog = ({ open, onClose, onSubmit, status, wayId, complaint, wayDateItem }) => {
  const [selectedType, setSelectedType] = useState(
    status !== undefined ? Number(status) : 0
  );
  const [wayDate, setWayDate] = useState("");
  const [complaintText, setComplaintText] = useState("");

  const complaintInputRef = useRef(null);

  useEffect(() => {
    
    if (open) {
      setSelectedType(status !== undefined ? Number(status) : 0);
      setWayDate(wayDateItem || "");
      setComplaintText(complaint || "");
    }
  }, [open, status, complaint, wayDateItem]);

  useEffect(() => {
    if (selectedType === 3) {
      setTimeout(() => {
        complaintInputRef.current?.querySelector('input')?.focus();
      }, 100);
    }
  }, [selectedType]);

  const handleSubmit = () => {
    onSubmit?.({
      wayId,
      status: selectedType,
      wayDate,
      complaint: complaintText,
    });
    onClose();
  };

  return (
    <Dialog open={open} handler={onClose} size="xs" className="!max-w-[90%] sm:!max-w-sm">
      <DialogHeader className="text-lg text-blue-gray-700">
        Choose Status
      </DialogHeader>

      <DialogBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 px-3 sm:px-5">
          {statusList
            .filter((item) => item.value !== 0)
            .map((item) => {
              const isSelected = Number(selectedType) === Number(item.value);

              return (
                <div
                  key={item.value}
                  className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-none"
                >

                  {/* Main Row: Radio နဲ့ Date Input ကို Responsive ဖြစ်အောင် Grid သုံးမယ် */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center w-full">

                    {/* ဘယ်ဘက်ခြမ်း: Radio Button */}
                    <div className="min-w-0 w-full">
                      <Radio
                        name="status-type"
                        checked={isSelected}
                        onChange={() => setSelectedType(Number(item.value))}
                        label={
                          <Typography className="text-sm font-semibold text-blue-gray-600 truncate">
                            {item.label}
                          </Typography>
                        }
                        containerProps={{ className: "p-2" }}
                      />
                    </div>
                  </div>

                  {isSelected && [2, 3, 4, 5].includes(item.value) && (
                    <div className="w-full pl-7 sm:pl-0">

                      <Input
                        type="datetime-local"
                        label="Select Way Date"
                        name="wayDate"
                        className="w-full min-w-0 text-sm" 
                        value={wayDate ? wayDate.replace(" ", "T").slice(0, 16) : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue) {
                            let formattedDate = rawValue.replace("T", " ");
                            if (formattedDate.length === 16) formattedDate += ":00";
                            setWayDate(formattedDate);
                          } else {
                            setWayDate("");
                          }
                        }}
                      />
                    </div>
                  )}

               
                  {isSelected && item.value === 3 && (
                    <div className="w-full pl-7 sm:pl-0 mt-1 animate-fade-in">
                      <Input
                        ref={complaintInputRef}
                        label="Complaint"
                        name="complaint"
                        className="w-full"
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                      />
                    </div>
                  )}

                </div>
              );
            })}
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-end gap-3">
        <Button variant="text" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="gradient" color="green" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
