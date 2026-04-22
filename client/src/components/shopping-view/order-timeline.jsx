import React from "react";
import { Check, Package, Truck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const statuses = [
  { id: "pending", label: "Placed", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: Check },
  { id: "inProcess", label: "Processing", icon: Package },
  { id: "inShipping", label: "Shipping", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function OrderTimeline({ currentStatus }) {
  const isRejected = currentStatus === "rejected";
  
  if (isRejected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-8 bg-red-50/50 rounded-2xl border border-red-100 shadow-sm"
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-700 font-bold uppercase tracking-widest text-[10px]">Order Cancelled / Rejected</p>
      </motion.div>
    );
  }

  const currentStepIndex = statuses.findIndex((s) => s.id === currentStatus);
  const safeStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="w-full py-10 px-2 sm:px-6 bg-gray-50/30 rounded-2xl border border-gray-100">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 z-0" />
        
        {/* Progress Line */}
        <motion.div 
          className="absolute top-5 left-0 h-[2px] bg-black z-0 origin-left" 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: safeStepIndex / (statuses.length - 1) }}
          transition={{ duration: 1, ease: "circOut" }}
          style={{ width: "100%" }}
        />

        {statuses.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= safeStepIndex;
          const isCurrent = index === safeStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isActive ? (isCurrent ? 1.2 : 1) : 0.9,
                  opacity: 1 
                }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive 
                    ? "bg-black border-black text-white shadow-xl shadow-black/10" 
                    : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <div className="mt-4 text-center">
                <p 
                  className={`text-[9px] font-bold uppercase tracking-tight transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                   <motion.div 
                    layoutId="current-dot"
                    className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 mx-auto"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                   />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;
