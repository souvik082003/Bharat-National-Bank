export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in p-4" onClick={onClose}>
            <div className="animate-scale-in max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
