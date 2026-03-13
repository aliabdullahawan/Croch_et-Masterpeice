/* ════════════════════════════════════════════════════════════════
   components/ui/NotificationToast.tsx
   Toast notification stack — rendered at bottom-right of screen.
   Used by both user site and admin panel. 
════════════════════════════════════════════════════════════════ */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

const ICONS = {
  success: <CheckCircle  size={18} className="text-green-400" />,
  info:    <Info         size={18} className="text-blue-400"  />,
  warning: <AlertTriangle size={18} className="text-amber-400" />,
  error:   <AlertCircle  size={18} className="text-red-400"   />,
};

const BORDERS = {
  success: "border-l-green-400",
  info:    "border-l-blue-400",
  warning: "border-l-amber-400",
  error:   "border-l-red-400",
};

export default function NotificationToast() {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 60, scale: 0.9  }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={`
              pointer-events-auto
              flex items-start gap-3
              bg-white/95 backdrop-blur-md
              border border-[rgba(61,43,31,0.12)] border-l-4 ${BORDERS[toast.type]}
              rounded-xl shadow-xl px-4 py-3 max-w-xs w-full
            `}
          >
            <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
            <p className="flex-1 text-sm text-[#3D2B1F] font-body leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-[#7A5A48] hover:text-[#3D2B1F] transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
